import { customAlert } from "../alerts";
import { SubcommandMeta } from "../Command";
import { formatDate } from "../utils";

const noteAdd = (input: string): void => {
    const commandInput = document.getElementById("commandline") as HTMLInputElement;
    window.electronAPI.getAppPreferences()
        .then(prefs => {
            const notes = prefs["notes"]
            const newNote = input.split(",");
        
            if (newNote.length !== 2) {
                commandInput.value = "";
                commandInput.placeholder = "Wrong syntax! Example: note add Title,This is an extremely important note";
                setTimeout(() => {
                    commandInput.placeholder = "Enter a command";
                }, 5000);
                return;
            }

            const newNoteTitle = newNote[0];
            const newNoteBody = newNote.slice(1).join(",")
            const newNoteTime = formatDate(new Date())
                
            notes.push({title: newNoteTitle, body: newNoteBody, time: newNoteTime});
            window.electronAPI.setAppPreference("notes", notes)
        
            commandInput.value = "";
            commandInput.placeholder = `New note added: [${notes.length}] ${newNote[0]}`;
            setTimeout(() => {
                commandInput.placeholder = "Enter a command";
            }, 3000);
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

const noteRemove = (input: string): void => {
    const commandInput = document.getElementById("commandline") as HTMLInputElement;
    window.electronAPI.getAppPreferences()
        .then(prefs => {
            const notes = prefs["notes"];
            const index = parseInt(input) - 1;
        
            commandInput.value = "";
            if (index >= notes.length) {
                commandInput.placeholder = `Invalid number. Check again by typing 'notes list'`;
                return;
            }
        
            commandInput.placeholder = `Removed note '${notes[index]["title"]}'`;
            
            notes.splice(index, 1);
            window.electronAPI.setAppPreference("notes", notes)
            setTimeout(function () {
                commandInput.placeholder = "Enter a command";
            }, 2000);
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

const noteList = (): void => {
    const commandInput = document.getElementById("commandline") as HTMLInputElement;
    window.electronAPI.getAppPreferences()
        .then(prefs => {
            const notes = prefs["notes"]
        
            commandInput.value = "";
            if (notes.length != 0) {
                let notesString = "";
                for (let i = 0; i < notes.length; i++) {
                    notesString += `<b>[${i + 1}] ${notes[i]["title"]}</b> <i>(${notes[i]["time"]})</i>\n`;
                    notesString += `${notes[i]["body"]}\n\n`
                }
                customAlert("Notes", notesString)
            } else {
                commandInput.placeholder = "You haven't saved any notes";
            }
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

export class NoteCommand {
    static subcommands: { [subcommand: string]: SubcommandMeta } = {
        add: {
            func: noteAdd,
            example: "Title,This is an extremely important note",
            description: "Add a new note (title, note)",
        },
        remove: {
            func: noteRemove,
            example: "1",
            description: "Remove a saved note by its number",
        },
        list: {
            func: noteList,
            example: "",
            description: "Show all saved notes",
        }
    };

    static execute(subcommand: string, rest: string): void {
        const meta = NoteCommand.subcommands[subcommand];
        console.log({ subcommand, rest })
        if (meta) {
            meta.func(rest);  // rest is the full string after subcommand
        } else {
            console.warn(`Unknown note subcommand: ${subcommand}`);
        }
    }
}