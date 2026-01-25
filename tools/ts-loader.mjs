import { access, readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import ts from 'typescript';

const resolveWithExtension = async (baseUrl) => {
  if (extname(baseUrl)) {
    return baseUrl;
  }

  const candidates = [
    `${baseUrl}.ts`,
    `${baseUrl}.tsx`,
    `${baseUrl}.js`,
    `${baseUrl}/index.ts`,
    `${baseUrl}/index.tsx`,
    `${baseUrl}/index.js`,
  ];

  for (const candidate of candidates) {
    try {
      await access(new URL(candidate));
      return candidate;
    } catch {
      // continue
    }
  }

  return baseUrl;
};

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('@/')) {
    const resolvedBase = new URL(`../src/${specifier.slice(2)}`, import.meta.url);
    const resolvedUrl = await resolveWithExtension(resolvedBase.href);
    return {
      url: resolvedUrl,
      shortCircuit: true,
    };
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const resolved = await resolveWithExtension(
      new URL(specifier, context.parentURL).href
    );
    return {
      url: resolved,
      shortCircuit: true,
    };
  }

  if (specifier === 'next/server') {
    return defaultResolve('next/server.js', context, defaultResolve);
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const source = await readFile(new URL(url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.React,
      },
    });

    return {
      format: 'module',
      source: outputText,
      shortCircuit: true,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
