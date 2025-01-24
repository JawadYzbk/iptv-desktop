export namespace service {
	
	export enum CacheType {
	    COUNTRIES = "countries",
	    CATEGORIES = "categories",
	    LANGUAGES = "languages",
	    CHANNELS = "channels",
	    STREAMS = "stream",
	    CHANNEL_HAS_STREAM = "channel_has_stream",
	}
	export enum IPTVFilter {
	    COUNTRY = "COUNTRY",
	    CATEGORY = "CATEGORY",
	    LANGUAGE = "LANGUAGE",
	    PLAYLIST = "PLAYLIST",
	}
	export class AppConfigCaption {
	    isAutoShow: boolean;
	
	    static createFrom(source: any = {}) {
	        return new AppConfigCaption(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isAutoShow = source["isAutoShow"];
	    }
	}
	export class AppConfigIPTV {
	    isOverrideApi: boolean;
	    apiUrl: string;
	    cacheDuration: number;
	    isUseAltChannelName: boolean;
	    isHideNSFWChannel: boolean;
	
	    static createFrom(source: any = {}) {
	        return new AppConfigIPTV(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isOverrideApi = source["isOverrideApi"];
	        this.apiUrl = source["apiUrl"];
	        this.cacheDuration = source["cacheDuration"];
	        this.isUseAltChannelName = source["isUseAltChannelName"];
	        this.isHideNSFWChannel = source["isHideNSFWChannel"];
	    }
	}
	export class AppConfigNetwork {
	    isUseDOH: boolean;
	    dohResolverUrl: string;
	
	    static createFrom(source: any = {}) {
	        return new AppConfigNetwork(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isUseDOH = source["isUseDOH"];
	        this.dohResolverUrl = source["dohResolverUrl"];
	    }
	}
	export class AppConfigUserInterface {
	    isUseSystemTitlebar: boolean;
	    isMaximizeAtStartup: boolean;
	
	    static createFrom(source: any = {}) {
	        return new AppConfigUserInterface(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isUseSystemTitlebar = source["isUseSystemTitlebar"];
	        this.isMaximizeAtStartup = source["isMaximizeAtStartup"];
	    }
	}
	export class Category {
	    id: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new Category(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}
	export class CategoriesResult {
	    error?: string;
	    data?: Category[];
	
	    static createFrom(source: any = {}) {
	        return new CategoriesResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], Category);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Stream {
	    channel: string;
	    url: string;
	    timeshift?: string;
	    http_referrer?: string;
	    user_agent?: string;
	
	    static createFrom(source: any = {}) {
	        return new Stream(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.channel = source["channel"];
	        this.url = source["url"];
	        this.timeshift = source["timeshift"];
	        this.http_referrer = source["http_referrer"];
	        this.user_agent = source["user_agent"];
	    }
	}
	export class ChannelWithStreams {
	    id: string;
	    name: string;
	    alt_names: string[];
	    network?: string;
	    owners: string[];
	    country: string;
	    subdivision?: string;
	    city?: string;
	    broadcast_area: string[];
	    languages: string[];
	    categories: string[];
	    is_nsfw: boolean;
	    launched?: string;
	    closed?: string;
	    replaced_by?: string;
	    website?: string;
	    logo: string;
	    streams: Stream[];
	
	    static createFrom(source: any = {}) {
	        return new ChannelWithStreams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.alt_names = source["alt_names"];
	        this.network = source["network"];
	        this.owners = source["owners"];
	        this.country = source["country"];
	        this.subdivision = source["subdivision"];
	        this.city = source["city"];
	        this.broadcast_area = source["broadcast_area"];
	        this.languages = source["languages"];
	        this.categories = source["categories"];
	        this.is_nsfw = source["is_nsfw"];
	        this.launched = source["launched"];
	        this.closed = source["closed"];
	        this.replaced_by = source["replaced_by"];
	        this.website = source["website"];
	        this.logo = source["logo"];
	        this.streams = this.convertValues(source["streams"], Stream);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ChannelWithStreamsResult {
	    error?: string;
	    data?: ChannelWithStreams;
	
	    static createFrom(source: any = {}) {
	        return new ChannelWithStreamsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], ChannelWithStreams);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Channel {
	    id: string;
	    name: string;
	    alt_names: string[];
	    network?: string;
	    owners: string[];
	    country: string;
	    subdivision?: string;
	    city?: string;
	    broadcast_area: string[];
	    languages: string[];
	    categories: string[];
	    is_nsfw: boolean;
	    launched?: string;
	    closed?: string;
	    replaced_by?: string;
	    website?: string;
	    logo: string;
	
	    static createFrom(source: any = {}) {
	        return new Channel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.alt_names = source["alt_names"];
	        this.network = source["network"];
	        this.owners = source["owners"];
	        this.country = source["country"];
	        this.subdivision = source["subdivision"];
	        this.city = source["city"];
	        this.broadcast_area = source["broadcast_area"];
	        this.languages = source["languages"];
	        this.categories = source["categories"];
	        this.is_nsfw = source["is_nsfw"];
	        this.launched = source["launched"];
	        this.closed = source["closed"];
	        this.replaced_by = source["replaced_by"];
	        this.website = source["website"];
	        this.logo = source["logo"];
	    }
	}
	export class ChannelsResult {
	    error?: string;
	    data?: Channel[];
	
	    static createFrom(source: any = {}) {
	        return new ChannelsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], Channel);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Config {
	    iptv: AppConfigIPTV;
	    network: AppConfigNetwork;
	    caption: AppConfigCaption;
	    userInterface: AppConfigUserInterface;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.iptv = this.convertValues(source["iptv"], AppConfigIPTV);
	        this.network = this.convertValues(source["network"], AppConfigNetwork);
	        this.caption = this.convertValues(source["caption"], AppConfigCaption);
	        this.userInterface = this.convertValues(source["userInterface"], AppConfigUserInterface);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Country {
	    name: string;
	    code: string;
	    languages: string[];
	    flag: string;
	
	    static createFrom(source: any = {}) {
	        return new Country(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.code = source["code"];
	        this.languages = source["languages"];
	        this.flag = source["flag"];
	    }
	}
	export class CountriesResult {
	    error?: string;
	    data?: Country[];
	
	    static createFrom(source: any = {}) {
	        return new CountriesResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], Country);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Language {
	    code: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new Language(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.name = source["name"];
	    }
	}
	export class LanguagesResult {
	    error?: string;
	    data?: Language[];
	
	    static createFrom(source: any = {}) {
	        return new LanguagesResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], Language);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Playlist {
	    playlistId: number;
	    title: string;
	    createdt: string;
	
	    static createFrom(source: any = {}) {
	        return new Playlist(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.playlistId = source["playlistId"];
	        this.title = source["title"];
	        this.createdt = source["createdt"];
	    }
	}
	export class PlaylistItem {
	    playlistId: number;
	    channelId: string;
	
	    static createFrom(source: any = {}) {
	        return new PlaylistItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.playlistId = source["playlistId"];
	        this.channelId = source["channelId"];
	    }
	}
	export class PlaylistItemsResult {
	    error?: string;
	    data?: PlaylistItem[];
	
	    static createFrom(source: any = {}) {
	        return new PlaylistItemsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], PlaylistItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PlaylistsResult {
	    error?: string;
	    data?: Playlist[];
	
	    static createFrom(source: any = {}) {
	        return new PlaylistsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], Playlist);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SinglePlaylistItemResult {
	    error?: string;
	    data?: PlaylistItem;
	
	    static createFrom(source: any = {}) {
	        return new SinglePlaylistItemResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], PlaylistItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SinglePlaylistResult {
	    error?: string;
	    data?: Playlist;
	
	    static createFrom(source: any = {}) {
	        return new SinglePlaylistResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], Playlist);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

