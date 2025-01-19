package service

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	"github.com/adrg/xdg"
	_ "modernc.org/sqlite"
)

type DB struct {
	db *sql.DB
}

func NewDB() (*DB, error) {
	dbFilePath, err := xdg.ConfigFile("iptv-desktop/db.sqlite")
	if err != nil {
		return nil, fmt.Errorf("could not resolve path for config file: %w", err)
	}
	dir, _ := filepath.Split(dbFilePath)
	_, err = os.Stat(dir)
	if os.IsNotExist(err) {
		os.MkdirAll(dir, 0755)
	}

	db, err := sql.Open("sqlite", dbFilePath)
	if err != nil {
		return nil, err
	}

	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return nil, err
	}

	newDb := &DB{
		db: db,
	}

	err = newDb.migrate()
	if err != nil {
		return nil, err
	}

	return newDb, nil
}

func (d *DB) Close() error {
	return d.db.Close()
}

func (d *DB) migrate() error {
	queries := []func(d *DB) error{
		func(d *DB) error {
			return d.multiQuery([]string{
				"CREATE TABLE `version` (`version` INTEGER PRIMARY KEY NOT NULL)",
				"CREATE TABLE `configs` (`key` TEXT PRIMARY KEY NOT NULL, `value` TEXT NOT NULL)",
				"CREATE TABLE `playlists` (`playlistId` INTEGER PRIMARY KEY AUTOINCREMENT, `title` TEXT NOT NULL, `createdAt` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
				"CREATE TABLE `playlistItems` (`playlistId` INTEGER NOT NULL, `channelId` TEXT NOT NULL, PRIMARY KEY (`playlistId`, `channelId`), FOREIGN KEY (`playlistId`) REFERENCES `playlists`(`playlistId`) ON DELETE CASCADE ON UPDATE CASCADE)",
			})
		},
	}

	row := d.db.QueryRow("SELECT MAX(version) FROM version")
	var version int = -1

	row.Scan(&version)

	if len(queries)-1 > version {
		for i := version + 1; i < len(queries); i++ {
			err := queries[i](d)
			if err != nil {
				return err
			}
		}

		_, err := d.db.Exec("INSERT INTO `version` (`version`) VALUES (?)", len(queries)-1)
		if err != nil {
			return err
		}
	}

	return nil
}

func (d *DB) multiQuery(queries []string) error {
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	for _, query := range queries {
		_, err = tx.Exec(query)
		if err != nil {
			tx.Rollback()
			return err
		}
	}
	return tx.Commit()
}

type dbConfig struct {
	Key   string
	Value string
}

func (d *DB) GetAllConfig() (*[]dbConfig, error) {
	rows, err := d.db.Query("SELECT `key`, `value` FROM `configs`")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []dbConfig
	for rows.Next() {
		var result dbConfig
		err = rows.Scan(&result.Key, &result.Value)
		if err != nil {
			return nil, err
		}
		results = append(results, result)
	}

	return &results, nil
}

func (d *DB) DeleteConfig(key string) error {
	_, err := d.db.Exec("DELETE FROM `configs` WHERE `key` = ?", key)
	return err
}

func (d *DB) SetMultipleConfig(configs []dbConfig) error {
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}

	for _, config := range configs {
		_, err = tx.Exec("INSERT OR REPLACE INTO `configs` (`key`, `value`) VALUES (?, ?)", config.Key, config.Value)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}
