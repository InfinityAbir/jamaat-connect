import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const root = process.cwd();
const input = path.join(root, 'src', 'styles.css');
const output = path.join(root, 'src', 'tailwind.generated.css');
const css = await fs.readFile(input, 'utf8');
const result = await postcss([tailwind()]).process(css, { from: input, to: output });

await fs.writeFile(output, result.css);
