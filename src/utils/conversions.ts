import { DBQueueEntry, QueueEntry } from "./interfaces";

export function queueDBtoData(input: DBQueueEntry): QueueEntry {
    return ({
        ...input,
        classN: '',
        id: parseInt(input.id!),
        donate_amount: parseInt(input.donate_amount!),
        queue_number: parseInt(input.queue_number!),
        like_count: parseInt(input.like_count!),
        current: input.current!,
        played: input.played!,
        will_add: input.will_add!,
        visible: input.visible!,
        modView: false,
        style: 'simple-view',
        button_text: 'More',
        delete_button_text: 'Delete',
        delete_intention: false
    });
}