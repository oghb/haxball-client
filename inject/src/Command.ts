import { NoteCommand } from "./commands/notes";
import { ShortcutCommand } from "./commands/shortcut";

type CommandFunction = (arg: string) => void;

export interface SubcommandMeta {
    func: CommandFunction;
    example: string;
    description: string;
}

export class Command {
    static handlers: { [mainCommand: string]: (subcommand: string, rest: string) => void } = {
        shortcut: ShortcutCommand.execute,
        note: NoteCommand.execute
    };

    static subcommands: { [mainCommand: string]: { [subcommand: string]: SubcommandMeta } } = {
        shortcut: ShortcutCommand.subcommands,
        note: NoteCommand.subcommands,
    };
}