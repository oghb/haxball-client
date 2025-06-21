import { AuthCommand } from "./commands/auth";
import { FpsCommand } from "./commands/fps";
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
        fps: FpsCommand.execute,
        note: NoteCommand.execute,
        auth: AuthCommand.execute
    };

    static subcommands: { [mainCommand: string]: { [subcommand: string]: SubcommandMeta } } = {
        shortcut: ShortcutCommand.subcommands,
        fps: FpsCommand.subcommands,
        note: NoteCommand.subcommands,
        auth: AuthCommand.subcommands
    };
}