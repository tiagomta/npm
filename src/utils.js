export function parse(input) {
    const args = [];
    const options = {};
    if (typeof input === "string") {
        input = input.match(/(?:[^\s"]+|"[^"]*")+/g).map(option => option.replace(/(^"|"$)/g, ''));
        let i = 0;
        while (i < input.length) {
            const current = input[i];
            if (current.startsWith("--")) {
                const key = current.slice(2);
                let value = true;
                if (i + 1 < input.length && !input[i + 1].startsWith("--")) {
                    value = input[i + 1];
                    i++;
                }
                options[key] = value;
            }
            else args.push(current);
            i++;
        }
    }
    return [args, options];
}