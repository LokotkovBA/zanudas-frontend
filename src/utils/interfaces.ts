import { StringLiteralLike } from "typescript";

export interface UserData {
    id: number;
    display_name: string;
    profile_image_url: string;
    is_mod: boolean;
    is_admin: boolean;
}

export interface Filters{
    foreign: boolean; 
    russian: boolean; 
    ost: boolean; 
    wide_racks: boolean;
}

export interface SongListEntry{
    id?: number;
    artist: string;
    song_name: string;
    date: string;
    tag: string;
    count: number;
}

export interface DBSongListEntry{
    id: string;
    artist: string;
    song_name: string;
    date: string;
    tag: string;
    count: string;
}