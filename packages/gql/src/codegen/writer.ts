import path from 'node:path';
import { A } from '@mobily/ts-belt';
import * as graphql from 'graphql';
import * as AST from '../ast';
import { getReferencedFragments } from '../parser/selection';
import { addIdAndTypenameField, capitalize, removeDirective, writeFile } from '../utils';
import { buildGraphQLFunctions, buildGraphQLTypes, buildSelectionsTSType, buildVariablesTSType } from './generator';
import type { Context, FragmentArtifact, OperationArtifact, StoreSchema } from '../types';

export const writeArtifactAssets = async ({ gqlDir, schema, artifacts }: Context) => {
  const operationArtifacts = artifacts.filter((v) => v.kind !== 'fragment') as OperationArtifact[];
  const fragmentArtifacts = artifacts.filter((v) => v.kind === 'fragment') as FragmentArtifact[];
  const fragmentMap = new Map(fragmentArtifacts.map((v) => [v.name, v]));

  for (const operation of operationArtifacts) {
    const fragments = A.uniqBy(getReferencedFragments(operation.selections, fragmentMap), (v) => v.name);

    const source = [operation.node, ...fragments.map((v) => v.node)]
      .map((v) => graphql.print(addIdAndTypenameField(schema, removeDirective(v, ['required', 'manual']))))
      .join('\n\n');

    const storeSchema: StoreSchema = {
      kind: operation.kind,
      name: operation.name,
      source,
      selections: {
        operation: operation.selections,
        fragments: Object.fromEntries(fragments.map((v) => [v.name, v.selections])),
      },
      meta: operation.meta,
    };

    const fn = `create${capitalize(operation.kind)}Store`;

    const program = AST.b.program([
      AST.b.importDeclaration.from({
        source: AST.b.stringLiteral('@readable/gql/runtime'),
        specifiers: [AST.b.importSpecifier(AST.b.identifier(fn))],
      }),
      AST.b.exportNamedDeclaration(
        AST.b.tsTypeAliasDeclaration.from({
          id: AST.b.identifier(operation.name),
          typeAnnotation: AST.b.tsTypeLiteral([
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$name'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(operation.name))),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$kind'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(operation.kind))),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$input'),
              typeAnnotation: AST.b.tsTypeAnnotation(buildVariablesTSType(operation.variables)),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$output'),
              typeAnnotation: AST.b.tsTypeAnnotation(buildSelectionsTSType(operation.selections)),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$meta'),
              typeAnnotation: AST.b.tsTypeAnnotation(
                AST.b.tsTypeLiteral(
                  Object.entries(operation.meta).map(([key, value]) =>
                    AST.b.tsPropertySignature.from({
                      key: AST.b.identifier(key),
                      typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(value))),
                    }),
                  ),
                ),
              ),
            }),
          ]),
        }),
      ),
      AST.b.variableDeclaration.from({
        kind: 'const',
        declarations: [
          AST.b.variableDeclarator.from({
            id: AST.b.identifier('schema'),
            init: AST.b.callExpression.from({
              callee: AST.b.identifier('JSON.parse'),
              arguments: [AST.b.stringLiteral(JSON.stringify(storeSchema))],
            }),
          }),
        ],
      }),
      AST.b.exportDefaultDeclaration.from({
        declaration: AST.b.functionDeclaration.from({
          id: null,
          params: [],
          body: AST.b.blockStatement([
            AST.b.returnStatement(
              AST.b.callExpression.from({
                callee: AST.b.identifier(fn),
                arguments: [AST.b.identifier('schema')],
                typeArguments: AST.b.typeParameterInstantiation([AST.b.typeParameter(operation.name)]),
              }),
            ),
          ]),
        }),
      }),
    ]);

    const content = AST.print(program);
    await writeFile(path.join(gqlDir, `artifacts/operations/${operation.name}.ts`), content);
  }

  for (const fragment of fragmentArtifacts) {
    const program = AST.b.program([
      AST.b.exportNamedDeclaration(
        AST.b.tsTypeAliasDeclaration.from({
          id: AST.b.identifier(fragment.name),
          typeAnnotation: AST.b.tsTypeLiteral([
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$name'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(fragment.name))),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$kind'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(fragment.kind))),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$input'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsTypeLiteral([])),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$output'),
              typeAnnotation: AST.b.tsTypeAnnotation(buildSelectionsTSType(fragment.selections)),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$meta'),
              typeAnnotation: AST.b.tsTypeAnnotation(
                AST.b.tsTypeLiteral(
                  Object.entries(fragment.meta).map(([key, value]) =>
                    AST.b.tsPropertySignature.from({
                      key: AST.b.identifier(key),
                      typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(value))),
                    }),
                  ),
                ),
              ),
            }),
          ]),
        }),
      ),
    ]);

    const content = AST.print(program);
    await writeFile(path.join(gqlDir, `artifacts/fragments/${fragment.name}.ts`), content);
  }
};

export const writePublicAssets = async ({ gqlDir, artifacts }: Context) => {
  const functions = buildGraphQLFunctions(artifacts);
  await writeFile(path.join(gqlDir, 'public/functions.d.ts'), AST.print(functions));

  const types = buildGraphQLTypes(artifacts);
  await writeFile(path.join(gqlDir, 'public/types.d.ts'), AST.print(types));

  const indexTs = AST.b.program([
    AST.b.exportAllDeclaration(AST.b.stringLiteral('./public/functions')),
    AST.b.exportAllDeclaration(AST.b.stringLiteral('./public/types')),
  ]);
  await writeFile(path.join(gqlDir, 'index.d.ts'), AST.print(indexTs));

  const indexJs = AST.b.program([AST.b.exportAllDeclaration(AST.b.stringLiteral('@readable/gql/runtime'))]);
  await writeFile(path.join(gqlDir, 'index.js'), AST.print(indexJs));
};

export const writeMiscAssets = async ({ gqlDir }: Context) => {
  const client = AST.b.program([
    AST.b.exportNamedDeclaration.from({
      declaration: null,
      specifiers: [
        AST.b.exportSpecifier.from({
          local: AST.b.identifier('default'),
          exported: AST.b.identifier('default'),
        }),
      ],
      source: AST.b.stringLiteral('../src/lib/graphql'),
    }),
  ]);
  await writeFile(path.join(gqlDir, 'client.js'), AST.print(client));
};

export const writeTypeAssets = async ({ projectDir, gqlDir, artifacts }: Context) => {
  const queries = artifacts.filter((v) => v.kind === 'query' && v.meta.mode !== 'manual') as OperationArtifact[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeMap = new Map<string, any[]>();

  for (const query of queries) {
    const basepath = path.relative(projectDir, path.dirname(query.file));
    const filename = path.join(gqlDir, 'types', basepath, '$graphql.d.ts');
    const eventName = path.basename(query.file).startsWith('+layout') ? 'LayoutLoadEvent' : 'PageLoadEvent';

    const types = typeMap.get(filename) ?? [];

    types.push(
      AST.b.importDeclaration.from({
        importKind: 'type',
        source: AST.b.stringLiteral(
          path.relative(path.dirname(filename), path.join(projectDir, '.svelte-kit/types', basepath, '$types.d.ts')),
        ),
        specifiers: [
          AST.b.importSpecifier.from({
            imported: AST.b.identifier(eventName),
          }),
        ],
      }),
      AST.b.importDeclaration.from({
        importKind: 'type',
        source: AST.b.stringLiteral(
          path.relative(path.dirname(filename), path.join(gqlDir, `artifacts/operations/${query.name}`)),
        ),
        specifiers: [
          AST.b.importSpecifier.from({
            imported: AST.b.identifier(query.name),
          }),
        ],
      }),
      AST.b.exportNamedDeclaration.from({
        declaration: AST.b.tsTypeAliasDeclaration.from({
          id: AST.b.identifier(`${query.name}_Variables`),
          typeAnnotation: AST.b.tsTypeReference.from({
            typeName: AST.b.identifier('VariablesFn'),
            typeParameters: AST.b.tsTypeParameterInstantiation([
              AST.b.tsTypeReference(AST.b.identifier(eventName)),
              AST.b.tsTypeReference(AST.b.identifier(query.name)),
            ]),
          }),
        }),
      }),
      AST.b.exportNamedDeclaration.from({
        declaration: AST.b.tsTypeAliasDeclaration.from({
          id: AST.b.identifier(`${query.name}_AfterLoad`),
          typeAnnotation: AST.b.tsTypeReference.from({
            typeName: AST.b.identifier('AfterLoadFn'),
            typeParameters: AST.b.tsTypeParameterInstantiation([
              AST.b.tsTypeReference(AST.b.identifier(eventName)),
              AST.b.tsTypeReference(AST.b.identifier(query.name)),
            ]),
          }),
        }),
      }),
    );

    typeMap.set(filename, types);
  }

  for (const [filename, types] of typeMap) {
    const program = AST.b.program([
      AST.b.importDeclaration.from({
        importKind: 'type',
        source: AST.b.stringLiteral('@readable/gql/runtime'),
        specifiers: [
          AST.b.importSpecifier.from({
            imported: AST.b.identifier('VariablesFn'),
          }),
          AST.b.importSpecifier.from({
            imported: AST.b.identifier('AfterLoadFn'),
          }),
        ],
      }),
      ...types,
    ]);

    await writeFile(filename, AST.print(program));
  }
};
