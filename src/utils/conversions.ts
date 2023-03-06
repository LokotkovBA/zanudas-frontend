import { DBQueueEntry, QueueEntry } from '../pages/Queue';

export function queueDBtoData(input: DBQueueEntry): QueueEntry {
    return ({
        ...input,
        classN: '',
        mod_view: false,
        style: 'simple-view',
        button_text: 'More',
        delete_button_text: 'Delete',
        delete_intention: false
    });
}
