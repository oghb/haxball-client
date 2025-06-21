export const waitForElement = (selector: string, inGameFrame: boolean = true): Promise<Element> => {
    return new Promise((resolve, reject) => {
        const gameframe = document.getElementsByClassName("gameframe")[0] as HTMLIFrameElement;
        if (!gameframe?.contentDocument) {
            reject(new Error("Gameframe or contentDocument not found"));
            return;
        }

        const element = inGameFrame
            ? gameframe.contentDocument.querySelector(selector)
            : document.querySelector(selector)
        if (element) {
            // console.log("Element found immediately:", element);
            resolve(element);
            return;
        }

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of Array.from(mutation.addedNodes)) {
                    if (node instanceof Element && node.matches(selector)) {
                        // console.log("Element found via MutationObserver:", node);
                        resolve(node);
                        observer.disconnect(); // Important: stop observing once found
                        return;
                    }
                }
            }
        });

        observer.observe(gameframe.contentDocument, {
            childList: true,
            subtree: true,
        });
    });
}