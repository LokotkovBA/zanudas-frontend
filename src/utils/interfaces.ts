export interface UserData {
    id: number;
    display_name: string;
    profile_image_url: string;
    is_mod: boolean;
    is_admin: boolean;
};

export interface Filters {
    foreign: boolean;
    russian: boolean;
    ost: boolean;
    wide_racks: boolean;
};

export interface SongListEntry {
    id?: number;
    artist: string;
    song_name: string;
    date: string;
    tag: string;
    count: number;
};

export interface DBSongListEntry {
    id: string;
    artist: string;
    song_name: string;
    date: string;
    tag: string;
    count: string;
};

export interface DBQueueEntry {
    id: string;
    artist: string;
    song_name: string;
    donor_name: string;
    donate_amount: string;
    currency: string;
    donor_text: string;
    tag: string;
    queue_number: string;
    like_count: string;
    played: boolean;
    will_add: boolean;
    visible: boolean;
    current: boolean;
    classN?: string;
};

export interface QueueEntry {
    id: number;
    artist: string;
    song_name: string;
    donor_name: string;
    donate_amount: number;
    currency: string;
    donor_text: string;
    tag: string;
    queue_number: number;
    like_count: number;
    played: boolean;
    will_add: boolean;
    visible: boolean;
    current: boolean;
    classN?: string;
};

export interface DBLikesState {
    is_positive: number;
    song_id: string;
};

export interface LikesState {
    is_positive: number;
    song_id: number;
};