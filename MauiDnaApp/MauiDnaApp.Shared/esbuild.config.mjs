import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: [
    { in: './ts/animations/circuit/index.ts', out: 'circuit' },
    { in: './ts/animations/dna/index.ts', out: 'dna' },
    { in: './ts/animations/networking/index.ts', out: 'networking' },
    { in: './ts/animations/neurons/index.ts', out: 'neurons' },
    { in: './ts/animations/pocketwatch/index.ts', out: 'pocketwatch' },
    { in: './ts/animations/thinking/index.ts', out: 'thinking' },
    { in: './ts/animations/thrust/index.ts', out: 'thrust' }
  ],
  bundle: true,
  outdir: './wwwroot/js',
  format: 'esm',
  minify: !isWatch,
});

if (isWatch) {
  await ctx.watch();
  console.log("esbuild watcher started...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log("All TS animations built successfully to wwwroot.");
}
