import { Command } from "../Command";
import { waitForElement } from "../waitForElement";

export const setupCommandBar = async (): Promise<void> => {
    const targetElement = await waitForElement("body > div > div.flexCol.flexGrow > div", false)

    // Wrapper stays full width
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.width = "100%";
    wrapper.style.margin = "0";
    wrapper.style.padding = "0";

    // Command input: full width
    const commandInput = document.createElement("input");
    commandInput.type = "text";
    commandInput.id = "commandline";
    commandInput.placeholder = "Enter a command";
    commandInput.style.fontSize = "20px";
    commandInput.style.width = "100%"; // Full width
    commandInput.style.padding = "5px 7px";
    commandInput.style.outline = "none";
    commandInput.style.resize = "none";
    commandInput.style.overflow = "auto";
    commandInput.style.zIndex = "10";
    commandInput.style.position = "relative";
    commandInput.style.boxSizing = "border-box"; // Important to avoid growing
    commandInput.style.border = "2px solid #1b2125";
    commandInput.style.borderTopColor = "#b3413b";
    commandInput.style.borderTopWidth = "2px";
    commandInput.style.backgroundColor = "#1b2125";
    commandInput.style.color = "white";

    // Dropdown: fixed small width, positioned below input
    const dropdown = document.createElement("div");
    dropdown.style.position = "absolute";
    dropdown.style.top = "calc(100% + 2px)"; // slightly below the input
    dropdown.style.left = "0";
    dropdown.style.width = "300px"; // Small width
    dropdown.style.background = "#1b2125";
    dropdown.style.border = "1px solid #444";
    dropdown.style.borderTop = "none";
    dropdown.style.maxHeight = "200px";
    dropdown.style.overflowY = "auto";
    dropdown.style.display = "none";
    dropdown.style.fontSize = "18px";
    dropdown.style.zIndex = "5";
    dropdown.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
    dropdown.style.boxSizing = "border-box";

    wrapper.appendChild(commandInput);
    wrapper.appendChild(dropdown);

    // Insert wrapper after header
    document.getElementsByClassName("header")[0].after(wrapper);

    // Function to update dropdown options
    let selectedIndex = -1; // Track selected suggestion

    function measureTextWidth(html: string, fontSize: string = "18px", fontFamily: string = "sans-serif"): number {
        const measurer = document.createElement("div");
        measurer.style.position = "absolute";
        measurer.style.visibility = "hidden";
        measurer.style.whiteSpace = "nowrap";
        measurer.style.fontSize = fontSize;
        measurer.style.fontFamily = fontFamily;
        measurer.innerHTML = html;
        document.body.appendChild(measurer);
        const width = measurer.clientWidth;
        document.body.removeChild(measurer);
        return width;
    }

    function updateDropdown(filterText: string) {
        const COMMANDS = Object.keys(Command.handlers).sort();
        dropdown.innerHTML = '';
    
        const [main, sub = ''] = filterText.trim().split(' ');
    
        let matches: { text: string, description: string, example?: string }[] = [];
    
        const handler = Command.handlers[main];
    
        if (!handler) {
            matches = COMMANDS
                .filter(cmd => cmd.startsWith(main.toLowerCase()))
                .map(cmd => ({ text: cmd, description: '' }));
        } else {
            const subcommands = Command.subcommands[main];
            if (subcommands) {
                matches = Object.keys(subcommands)
                    .filter(subCmd => subCmd.startsWith(sub.toLowerCase()))
                    .map(subCmd => ({
                        text: `${main} ${subCmd}`,
                        description: subcommands[subCmd].description,
                        example: subcommands[subCmd].example
                    }));
            }
        }
    
        if (matches.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
    
        // Measure max command width for column alignment
        let maxCommandWidth = 0;
        matches.forEach(match => {
            const width = measureTextWidth(match.text, "18px", "sans-serif");
            if (width > maxCommandWidth) {
                maxCommandWidth = width;
            }
        });
    
        // Optional: Add some padding to measured width
        maxCommandWidth += 10;
    
        // Set dropdown width based on widest content + buffer
        const totalWidth = Math.min(maxCommandWidth + 500, 800);
        dropdown.style.width = `${totalWidth}px`;
    
        matches.forEach((match, index) => {
            const option = document.createElement("div");
            option.innerHTML = `
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; align-items: flex-start;">
                    <div style="min-width: ${maxCommandWidth}px; flex-shrink: 0;">
                        <strong style="color: inherit;">${match.text}</strong>
                    </div>
                    <em style="font-size: 0.85em; color: #aaa; padding-left: 10px; font-style: italic;">
                        ${match.description}
                    </em>
                </div>
                ${match.example && match.text.includes(' ') ? `
                    <div style="font-size: 0.75em; color: #ccc; margin-top: 2px; margin-left: ${maxCommandWidth + 10}px;">
                        <span style="font-style: bold">Example:</span> <span style="color: #ddd;">${match.text} ${match.example}</span>
                    </div>
                ` : ''}
            </div>
            `;
    
            option.style.padding = "6px 10px";
            option.style.cursor = "pointer";
            option.style.borderBottom = "1px solid #2a2f33";
    
            option.addEventListener("mouseenter", () => {
                selectedIndex = index;
                highlightSelected();
            });
    
            option.addEventListener("mouseleave", () => {
                selectedIndex = -1;
                highlightSelected();
            });
    
            option.addEventListener("click", () => {
                commandInput.value = match.text;
                dropdown.style.display = "none";
                commandInput.focus();
            });
    
            dropdown.appendChild(option);
        });
    
        dropdown.style.display = 'block';
    }

    function highlightSelected() {
        for (let i = 0; i < dropdown.children.length; i++) {
            const child = dropdown.children[i] as HTMLElement;
            child.style.background = (i === selectedIndex) ? "#3b5d82" : "transparent";
        }
    }
    function updateExample() {
        const [mainCommand, subCommand] = commandInput.value.trim().split(" ");
        if (subCommand) {
            const meta = Command.subcommands[mainCommand]?.[subCommand];
            if (meta && meta.example) {
                commandInput.placeholder = `Example: ${mainCommand} ${subCommand} ${meta.example}`;
            } else {
                commandInput.placeholder = "Enter a command";
            }
        } else {
            commandInput.placeholder = "Enter a command";
        }
    }

    // Add keydown listener for navigation:
    commandInput.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" && dropdown.children.length > 0) {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % dropdown.children.length;
            highlightSelected();
        }
    
        if (e.key === "ArrowUp" && dropdown.children.length > 0) {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + dropdown.children.length) % dropdown.children.length;
            highlightSelected();
        }
    
        if ((e.key === "Tab") && dropdown.children.length > 0) {
            e.preventDefault();
            if (selectedIndex === -1) selectedIndex = 0;
            const selected = dropdown.children[selectedIndex] as HTMLElement;
            const text = selected.querySelector("strong")?.textContent;
            if (text) {
                const parts = commandInput.value.trim().split(" ");
                commandInput.value = text + " ";
                dropdown.style.display = "none";
                updateDropdown(commandInput.value.trim()); // Refresh dropdown after completing
                updateExample();
            }
        }
    });

    commandInput.addEventListener('input', () => {
        updateDropdown(commandInput.value.trim());
    });

    commandInput.addEventListener('focus', () => {
        updateDropdown(commandInput.value.trim());
    });

    commandInput.addEventListener('blur', () => {
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 150); // Small delay so clicks register
    });

    commandInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            const input = commandInput.value.trim();
            if (!input) return;

            const parts = input.split(" ");
            const mainCommand = parts[0];
            const subCommand = parts[1] || "";
            const restOfInput = parts.slice(2).join(" ");  // This is now your 'free text'

            const handler = Command.handlers[mainCommand];
            if (handler) {
                // Call the handler with subCommand and the rest of the input
                handler(subCommand, restOfInput);
            } else {
                commandInput.placeholder = `Unknown command: ${mainCommand}`;
                setTimeout(() => {
                    commandInput.placeholder = "Enter a command";
                }, 3000);
            }

            commandInput.value = ""; // Clear after execution
        }
    });

    const gameframe = document.getElementsByClassName('gameframe')[0] as HTMLIFrameElement;
    gameframe.contentWindow.addEventListener("keydown", (e) => {
        const target = e.target as HTMLElement;

        const isTyping =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable;

        if (!isTyping && e.key === "c" && !e.ctrlKey && !e.metaKey) {
            const isHidden = wrapper.style.display === "none";
            wrapper.style.display = isHidden ? "flex" : "none";
        }
    });
}
