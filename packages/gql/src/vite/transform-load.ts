import recast from 'recast';
import * as AST from '../ast';
import type { Plugin } from 'vite';
import type { ContextHolder } from '../types';

export const transformLoadPlugin = (contextHolder: ContextHolder): Plugin => {
  return {
    name: '@readable/gql:transform-load',
    enforce: 'post',

    transform: (code, id) => {
      const { context } = contextHolder;
      if (!context) {
        return;
      }

      if (!id.endsWith('+page.ts') && !id.endsWith('+layout.ts')) {
        return;
      }

      const queries = context.artifacts.filter(
        (artifact) =>
          artifact.kind === 'query' &&
          artifact.meta.mode !== 'manual' &&
          artifact.file.startsWith(id.replace(/\.ts$/, '')),
      );

      if (queries.length === 0) {
        return;
      }

      let program;
      try {
        program = AST.parse(code);
      } catch {
        return;
      }

      const exportedVariables: Record<string, recast.types.namedTypes.VariableDeclarator> = {};

      AST.walk(program, {
        visitExportNamedDeclaration(p) {
          const { node } = p;

          if (node.declaration?.type === 'VariableDeclaration') {
            for (const declaration of node.declaration.declarations) {
              if (declaration.type === 'VariableDeclarator' && declaration.id.type === 'Identifier') {
                exportedVariables[declaration.id.name] = declaration;
              }
            }
          }

          this.traverse(p);
        },
      });

      const loaders = ['__gql_load'];
      if ('load' in exportedVariables) {
        // @ts-expect-error already checked
        exportedVariables.load.id.name = '__gql_original_load';
        loaders.unshift('__gql_original_load');
      }

      program.body.push(
        AST.b.importDeclaration.from({
          source: AST.b.stringLiteral('svelte/store'),
          specifiers: [
            AST.b.importSpecifier.from({
              imported: AST.b.identifier('get'),
            }),
          ],
        }),
        ...queries.map((query) =>
          AST.b.importDeclaration.from({
            source: AST.b.stringLiteral(`$graphql/artifacts/operations/${query.name}`),
            specifiers: [
              AST.b.importDefaultSpecifier.from({
                local: AST.b.identifier(`__gql_${query.name}`),
              }),
            ],
          }),
        ),
        AST.b.functionDeclaration.from({
          id: AST.b.identifier('__gql_load'),
          params: [AST.b.identifier('event')],
          async: true,
          body: AST.b.blockStatement([
            AST.b.variableDeclaration.from({
              kind: 'const',
              declarations: queries.map((query) =>
                AST.b.variableDeclarator.from({
                  id: AST.b.identifier(query.name),
                  init: AST.b.awaitExpression(
                    AST.b.callExpression.from({
                      callee: AST.b.callExpression.from({
                        callee: AST.b.identifier(`__gql_${query.name}`),
                        arguments: [],
                      }),
                      arguments: [
                        AST.b.identifier('event.fetch'),
                        ...(`_${query.name}_Variables` in exportedVariables
                          ? [
                              AST.b.callExpression.from({
                                callee: AST.b.identifier(`_${query.name}_Variables`),
                                arguments: [AST.b.identifier('event')],
                              }),
                            ]
                          : []),
                      ],
                    }),
                  ),
                }),
              ),
            }),
            ...queries
              .filter((query) => `_${query.name}_AfterLoad` in exportedVariables)
              .map((query) =>
                AST.b.expressionStatement(
                  AST.b.awaitExpression(
                    AST.b.callExpression.from({
                      callee: AST.b.identifier(`_${query.name}_AfterLoad`),
                      arguments: [
                        AST.b.callExpression.from({
                          callee: AST.b.identifier('get'),
                          arguments: [AST.b.identifier(query.name)],
                        }),
                        AST.b.identifier('event'),
                      ],
                    }),
                  ),
                ),
              ),
            AST.b.returnStatement(
              AST.b.objectExpression(
                queries.map((query) =>
                  AST.b.objectProperty.from({
                    key: AST.b.identifier(`__gql_${query.name}`),
                    value: AST.b.identifier(query.name),
                  }),
                ),
              ),
            ),
          ]),
        }),
        AST.b.exportNamedDeclaration(
          AST.b.functionDeclaration.from({
            id: AST.b.identifier('load'),
            params: [AST.b.identifier('event')],
            async: true,
            body: AST.b.blockStatement([
              AST.b.returnStatement(
                AST.b.objectExpression(
                  loaders.map((loader) =>
                    AST.b.spreadProperty(
                      AST.b.awaitExpression(
                        AST.b.callExpression.from({
                          callee: AST.b.identifier(loader),
                          arguments: [AST.b.identifier('event')],
                        }),
                      ),
                    ),
                  ),
                ),
              ),
            ]),
          }),
        ),
      );

      return {
        code: AST.print(program),
        map: { mappings: '' },
      };
    },
  };
};