package service

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

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

func (d *DB) DeleteConfigs(keys []any) error {
	if len(keys) == 0 {
		return nil
	}

	bindMarks := make([]string, len(keys))
	for i := range keys {
		bindMarks[i] = "?"
	}

	questions := strings.Join(bindMarks, ", ")

	_, err := d.db.Exec("DELETE FROM `configs` WHERE `key` IN ("+questions+")", keys...)
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

type Playlist struct {
	PlaylistID int    `json:"playlistId"`
	Title      string `json:"title"`
	CreatedAt  string `json:"createdt"`
}

func (d *DB) ListPlaylist() (*[]Playlist, error) {
	query := "SELECT playlistId, title, createdAt FROM playlists ORDER BY title ASC"
	rows, err := d.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []Playlist
	for rows.Next() {
		var result Playlist
		err = rows.Scan(&result.PlaylistID, &result.Title, &result.CreatedAt)
		if err != nil {
			return nil, err
		}

		results = append(results, result)
	}

	err = rows.Err()
	return &results, err
}

func (d *DB) CreatePlaylist(title string) (*Playlist, error) {
	var result Playlist
	query := "INSERT INTO playlists (title) VALUES (?) RETURNING playlistId, createdAt"
	if err := d.db.QueryRow(query, title).Scan(&result.PlaylistID, &result.CreatedAt); err != nil {
		return nil, err
	}
	result.Title = title

	return &result, nil
}

func (d *DB) UpdatePlaylist(playlistId int, title string) (*Playlist, error) {
	var result Playlist
	query := "UPDATE playlists SET title = ? WHERE playlistId = ? RETURNING createdAt"
	if err := d.db.QueryRow(query, title, playlistId).Scan(&result.CreatedAt); err != nil {
		return nil, err
	}
	result.Title = title
	result.PlaylistID = playlistId

	return &result, nil
}

func (d *DB) DeletePlaylist(playlistId int) error {
	query := "DELETE FROM playlists WHERE playlistId = ?"
	_, err := d.db.Exec(query, playlistId)

	return err
}

type PlaylistItem struct {
	PlaylistID int    `json:"playlistId"`
	ChannelID  string `json:"channelId"`
}

func (d *DB) ListPlaylistItem(playlistId int) (*[]PlaylistItem, error) {
	query := "SELECT playlistId, channelId FROM playlistItems WHERE playlistId = ?"
	rows, err := d.db.Query(query, playlistId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []PlaylistItem

	for rows.Next() {
		var result PlaylistItem
		err = rows.Scan(&result.PlaylistID, &result.ChannelID)
		if err != nil {
			return nil, err
		}

		results = append(results, result)
	}

	err = rows.Err()
	return &results, err
}

func (d *DB) ListChannelPlaylist(channelId string) (*[]PlaylistItem, error) {
	query := "SELECT playlistId, channelId FROM playlistItems WHERE channelId = ?"
	rows, err := d.db.Query(query, channelId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []PlaylistItem

	for rows.Next() {
		var result PlaylistItem
		err = rows.Scan(&result.PlaylistID, &result.ChannelID)
		if err != nil {
			return nil, err
		}

		results = append(results, result)
	}

	err = rows.Err()
	return &results, err
}

func (d *DB) CreatePlaylistItem(playlistId int, channelId string) (*PlaylistItem, error) {
	query := "INSERT INTO playlistItems (playlistId, channelId) VALUES (?, ?)"
	_, err := d.db.Exec(query, playlistId, channelId)
	if err != nil {
		return nil, err
	}
	var result PlaylistItem
	result.PlaylistID = playlistId
	result.ChannelID = channelId

	return &result, nil
}

func (d *DB) DeletePlaylistItem(playlistId int, channelId string) error {
	query := "DELETE FROM playlistItems WHERE playlistId = ? AND channelId = ?"
	_, err := d.db.Exec(query, playlistId, channelId)

	return err
}
