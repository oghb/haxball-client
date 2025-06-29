export const formatDate = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export const createButton = (
		label: string,
		backgroundColor: string,
		overColor: string,
		onClick: () => void
	): HTMLButtonElement => {
		const btn = document.createElement('button');
		btn.textContent = label;
		btn.style.flex = '1';
		btn.style.padding = '8px 0';
		btn.style.fontSize = '14px';
		btn.style.fontWeight = 'bold';
		btn.style.border = 'none';
		btn.style.borderRadius = '5px';
		btn.style.cursor = 'pointer';
		btn.style.transition = 'background-color 0.2s, color 0.2s';
		btn.style.backgroundColor = backgroundColor;
		btn.style.color = 'white';

		btn.addEventListener('click', onClick);
		btn.addEventListener('mouseenter', () => {
			btn.style.backgroundColor = overColor;
		});
		btn.addEventListener('mouseleave', () => {
			btn.style.backgroundColor = backgroundColor;
		});

		return btn;
};
