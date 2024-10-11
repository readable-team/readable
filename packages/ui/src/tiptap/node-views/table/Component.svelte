<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { Icon, Menu, MenuItem, Tooltip } from '@readable/ui/components';
  import { mergeAttributes } from '@tiptap/core';
  import { createColGroup } from '@tiptap/extension-table';
  import { CellSelection, TableMap } from '@tiptap/pm/tables';
  import { tick } from 'svelte';
  import ArrowDownToLineIcon from '~icons/lucide/arrow-down-to-line';
  import ArrowLeftToLineIcon from '~icons/lucide/arrow-left-to-line';
  import ArrowRightToLineIcon from '~icons/lucide/arrow-right-to-line';
  import ArrowUpToLineIcon from '~icons/lucide/arrow-up-to-line';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import MoveDownIcon from '~icons/lucide/move-down';
  import MoveLeftIcon from '~icons/lucide/move-left';
  import MoveRightIcon from '~icons/lucide/move-right';
  import MoveUpIcon from '~icons/lucide/move-up';
  import PlusIcon from '~icons/lucide/plus';
  import Trash2Icon from '~icons/lucide/trash-2';
  import { NodeView, NodeViewContentEditable } from '../../lib';
  import type { Node } from '@tiptap/pm/model';
  import type { NodeViewProps } from '../../lib';

  type $$Props = NodeViewProps;
  $$restProps;

  let colgroupRendered = false;
  // eslint-disable-next-line unicorn/prefer-top-level-await
  tick().then(() => {
    colgroupRendered = true;
  });

  export let node: NodeViewProps['node'];
  export let HTMLAttributes: NodeViewProps['HTMLAttributes'];
  export let extension: NodeViewProps['extension'];
  export let editor: NodeViewProps['editor'] | undefined;
  // export let selected: NodeViewProps['selected'];
  // export let deleteNode: NodeViewProps['deleteNode'];
  export let getPos: NodeViewProps['getPos'];
  // export let updateAttributes: NodeViewProps['updateAttributes'];

  $: ({ colgroup, tableWidth, tableMinWidth } = createColGroup(node, extension.options.cellMinWidth));

  let cols: ['col', Record<string, string>][] = [];
  $: cols = (colgroup?.slice(2) as ['col', Record<string, string>][]) ?? [];

  let _colElems: HTMLElement[] = [];
  $: colElems = _colElems.filter(Boolean); // 열 삭제에 대응

  let hasSpan = false;
  $: {
    hasSpan = false;
    node.descendants((node) => {
      if (node.type.name === 'tableCell' && (node.attrs.colspan > 1 || node.attrs.rowspan > 1)) {
        hasSpan = true;
      }
    });
  }

  let rowElems: HTMLElement[] = [];

  async function getRows(tableNode: Node) {
    if (!editor || !tableNode) {
      return;
    }

    const { state, view } = editor;
    const { tr } = state;

    const map = TableMap.get(tableNode);
    const rowsLength = map.height;
    const tablePos = getPos();
    const tableStart = tablePos + 1;

    // table row가 렌더링되길 기다림
    await tick();

    rowElems = [];
    for (let i = 0; i < rowsLength; i++) {
      const pos = map.positionAt(i, 0, tableNode);
      const cellPos = tableStart + pos;
      const rowPos = tr.doc.resolve(cellPos - 1);
      const row = view.nodeDOM(rowPos.pos);
      if (row) {
        rowElems.push(row as HTMLElement);
      }
    }
  }

  // eslint-disable-next-line unicorn/prefer-top-level-await
  $: getRows(node);

  let hoveredRowIndex: number | null = null;
  let hoveredColumnIndex: number | null = null;
  $: isLastRowHovered = hoveredRowIndex === rowElems.length - 1;
  $: isLastColumnHovered = hoveredColumnIndex === cols.length - 1;
  function handlePointerover(event: PointerEvent) {
    const target = event.target as HTMLElement;

    const cell = target.closest('td,th');

    if (cell) {
      hoveredColumnIndex = (cell as HTMLTableCellElement).cellIndex;
      hoveredRowIndex = (cell.parentElement as HTMLTableRowElement).rowIndex;
    }
  }

  function addRowAtEnd(tableNode: Node) {
    if (!editor) {
      return;
    }

    const { state } = editor;
    const { tr } = state;

    const map = TableMap.get(tableNode);
    const lastRowIndex = map.height - 1;

    const tablePos = getPos();
    const tableStart = tablePos + 1;

    const cellPos = map.positionAt(lastRowIndex, 0, tableNode);
    const cellResolvedPos = tr.doc.resolve(tableStart + cellPos);

    editor.commands.setTextSelection(cellResolvedPos.pos);

    const result = editor.commands.addRowAfter();

    return result;
  }

  function addColumnAtEnd(tableNode: Node) {
    if (!editor) {
      return;
    }

    const { state } = editor;
    const { tr } = state;

    const map = TableMap.get(tableNode);
    const lastColumnIndex = map.width - 1;

    const tablePos = getPos();
    const tableStart = tablePos + 1;

    const cellPos = map.positionAt(0, lastColumnIndex, tableNode);
    const cellResolvedPos = tr.doc.resolve(tableStart + cellPos);

    editor.commands.setTextSelection(cellResolvedPos.pos);

    const result = editor.commands.addColumnAfter();

    return result;
  }

  function selectRow(rowIndex: number) {
    if (!editor) {
      return;
    }

    const { tr } = editor.state;

    const tablePos = getPos();
    const map = TableMap.get(node);
    const tableStart = tablePos + 1;

    if (rowIndex < 0 || rowIndex >= map.height) {
      return false;
    }

    const rowCells = map.cellsInRect({
      left: 0,
      right: map.width,
      top: rowIndex,
      bottom: rowIndex + 1,
    });

    const $anchorCell = tr.doc.resolve(tableStart + rowCells[0]);
    // eslint-disable-next-line unicorn/prefer-at
    const $headCell = tr.doc.resolve(tableStart + rowCells[rowCells.length - 1]);

    const rowSelection = CellSelection.rowSelection($anchorCell, $headCell);
    editor.view.dispatch(tr.setSelection(rowSelection));

    return true;
  }

  function selectColumn(colIndex: number) {
    if (!editor) {
      return;
    }

    const { tr } = editor.state;

    const tablePos = getPos();
    const map = TableMap.get(node);
    const tableStart = tablePos + 1;

    if (colIndex < 0 || colIndex >= map.width) {
      return false;
    }

    const colCells = map.cellsInRect({
      left: colIndex,
      right: colIndex + 1,
      top: 0,
      bottom: map.height,
    });

    const $anchorCell = tr.doc.resolve(tableStart + colCells[0]);
    // eslint-disable-next-line unicorn/prefer-at
    const $headCell = tr.doc.resolve(tableStart + colCells[colCells.length - 1]);

    const colSelection = CellSelection.colSelection($anchorCell, $headCell);
    editor.view.dispatch(tr.setSelection(colSelection));

    return true;
  }

  function swapRows(a: number, b: number) {
    if (!editor) {
      return false;
    }

    const { tr } = editor.state;

    let tableNode = node;
    let tablePos = getPos();

    if (hasSpan) {
      return false;
    }

    let map = TableMap.get(tableNode);

    if (a < 0 || a >= map.height || b < 0 || b >= map.height) {
      return false;
    }

    if (a === b) {
      return false;
    }

    const rowNodes = [];
    for (let rowIndex = 0; rowIndex < map.height; rowIndex++) {
      const row = tableNode.child(rowIndex);
      rowNodes.push(row);
    }

    const tempRow = rowNodes[a];
    rowNodes[a] = rowNodes[b];
    rowNodes[b] = tempRow;

    const tableType = tableNode.type;
    const newTable = tableType.createChecked(tableNode.attrs, rowNodes, tableNode.marks);

    tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable);

    editor.view.dispatch(tr);

    return true;
  }

  function swapColumns(a: number, b: number) {
    if (!editor) {
      return false;
    }

    const { tr } = editor.state;

    let tableNode = node;
    let tablePos = getPos();

    if (hasSpan) {
      return false;
    }

    let map = TableMap.get(tableNode);

    if (a < 0 || a >= map.width || b < 0 || b >= map.width) {
      return false;
    }

    if (a === b) {
      return false;
    }

    let rows = [];

    for (let rowIndex = 0; rowIndex < map.height; rowIndex++) {
      let row = tableNode.child(rowIndex);
      let cells = [];

      for (let cellIndex = 0; cellIndex < row.childCount; cellIndex++) {
        cells.push(row.child(cellIndex));
      }

      let temp = cells[a];
      cells[a] = cells[b];
      cells[b] = temp;

      let rowType = row.type;
      let newRow = rowType.createChecked(row.attrs, cells, row.marks);

      rows.push(newRow);
    }

    let tableType = tableNode.type;
    let newTable = tableType.createChecked(tableNode.attrs, rows, tableNode.marks);

    tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable);

    editor.view.dispatch(tr);

    return true;
  }
</script>

<NodeView style={css.raw({ position: 'relative' })}>
  <table
    on:pointerover={handlePointerover}
    on:pointerleave={() => {
      hoveredRowIndex = null;
      hoveredColumnIndex = null;
    }}
    {...mergeAttributes(extension.options.HTMLAttributes, HTMLAttributes, {
      class: css({
        position: 'relative',
        borderRadius: '4px',
        borderStyle: 'hidden',
        outline: '1px solid',
        outlineColor: 'neutral.30',
      }),
      style: tableWidth ? `width: ${tableWidth}` : `min-width: ${tableMinWidth}`,
    })}
  >
    <colgroup>
      <!-- @ts-ignore -->
      {#each cols as col, i (col)}
        <col bind:this={_colElems[i]} {...col[1]} />
      {/each}
    </colgroup>

    {#if editor?.isEditable}
      <div
        class={css({
          position: 'absolute',
          inset: '0',
        })}
        contenteditable={false}
        role="rowgroup"
      >
        {#each rowElems as row, i (row)}
          <div
            style:height={`${row.clientHeight}px`}
            style:top={`${row.offsetTop}px`}
            class={flex({
              position: 'absolute',
              left: '0',
              width: '30px',
              translateX: '-1/2',
              translate: 'auto',
              zIndex: '10',
              justifyContent: 'center',
              alignItems: 'center',
            })}
            role="row"
          >
            <Menu
              onOpen={() => {
                selectRow(i);
              }}
              placement="right-start"
              let:close
            >
              <div
                slot="button"
                class={center({
                  display: open || hoveredRowIndex === i ? 'flex' : 'none',
                  _hover: {
                    backgroundColor: 'neutral.20',
                  },
                  size: '24px',
                  color: 'text.tertiary',
                  borderRadius: '4px',
                  backgroundColor: 'neutral.10',
                  borderWidth: '1px',
                  borderColor: 'border.primary',
                })}
                let:open
              >
                <Icon icon={EllipsisIcon} size={20} />
              </div>

              {#if i !== 0}
                <Tooltip enabled={hasSpan} message="표에 병합된 셀이 없을 때만 이동할 수 있습니다.">
                  <MenuItem
                    disabled={hasSpan}
                    on:click={() => {
                      close();
                      swapRows(i, i - 1);
                    }}
                  >
                    <Icon icon={MoveUpIcon} size={14} />
                    <span>위로 이동</span>
                  </MenuItem>
                </Tooltip>
              {/if}

              {#if i !== cols.length - 1}
                <Tooltip enabled={hasSpan} message="표에 병합된 셀이 없을 때만 이동할 수 있습니다.">
                  <MenuItem
                    disabled={hasSpan}
                    on:click={() => {
                      close();
                      swapRows(i, i + 1);
                    }}
                  >
                    <Icon icon={MoveDownIcon} size={14} />
                    <span>아래로 이동</span>
                  </MenuItem>
                </Tooltip>
              {/if}

              <MenuItem
                on:click={() => {
                  close();
                  editor?.commands.addRowBefore();
                }}
              >
                <Icon icon={ArrowUpToLineIcon} size={14} />
                <span>위에 행 추가</span>
              </MenuItem>

              <MenuItem
                on:click={() => {
                  close();
                  editor?.commands.addRowAfter();
                }}
              >
                <Icon icon={ArrowDownToLineIcon} size={14} />
                <span>아래에 행 추가</span>
              </MenuItem>

              <MenuItem
                variant="danger"
                on:click={() => {
                  close();
                  editor?.commands.deleteRow();
                }}
              >
                <Icon icon={Trash2Icon} size={14} />
                <span>행 삭제</span>
              </MenuItem>
            </Menu>
          </div>
        {/each}
      </div>

      {#if colgroupRendered}
        {#each colElems as col, i (i)}
          <div
            style:left={`${col.offsetLeft}px`}
            style:width={`${col.clientWidth}px`}
            class={flex({
              position: 'absolute',
              top: '0',
              height: '30px',
              translateY: '-1/2',
              translate: 'auto',
              zIndex: '10',
              justifyContent: 'center',
              alignItems: 'center',
            })}
          >
            <Menu
              onOpen={() => {
                selectColumn(i);
              }}
              placement="bottom-start"
              let:close
            >
              <div
                slot="button"
                class={center({
                  display: open || hoveredColumnIndex === i ? 'flex' : 'none',
                  _hover: {
                    backgroundColor: 'neutral.20',
                  },
                  size: '24px',
                  color: 'text.tertiary',
                  borderRadius: '4px',
                  backgroundColor: 'neutral.10',
                  borderWidth: '1px',
                  borderColor: 'border.primary',
                })}
                let:open
              >
                <Icon icon={EllipsisIcon} size={20} />
              </div>

              {#if i !== 0}
                <Tooltip enabled={hasSpan} message="표에 병합된 셀이 없을 때만 이동할 수 있습니다.">
                  <MenuItem
                    disabled={hasSpan}
                    on:click={() => {
                      close();
                      swapColumns(i, i - 1);
                    }}
                  >
                    <Icon icon={MoveLeftIcon} size={14} />
                    <span>왼쪽으로 이동</span>
                  </MenuItem>
                </Tooltip>
              {/if}

              {#if i !== cols.length - 1}
                <Tooltip enabled={hasSpan} message="표에 병합된 셀이 없을 때만 이동할 수 있습니다.">
                  <MenuItem
                    disabled={hasSpan}
                    on:click={() => {
                      close();
                      swapColumns(i, i + 1);
                    }}
                  >
                    <Icon icon={MoveRightIcon} size={14} />
                    <span>오른쪽으로 이동</span>
                  </MenuItem>
                </Tooltip>
              {/if}

              <MenuItem
                on:click={() => {
                  close();
                  editor?.commands.addColumnBefore();
                }}
              >
                <Icon icon={ArrowLeftToLineIcon} size={14} />
                <span>왼쪽에 열 추가</span>
              </MenuItem>

              <MenuItem
                on:click={() => {
                  close();
                  editor?.commands.addColumnAfter();
                }}
              >
                <Icon icon={ArrowRightToLineIcon} size={14} />
                <span>오른쪽에 열 추가</span>
              </MenuItem>

              <MenuItem
                variant="danger"
                on:click={() => {
                  close();
                  editor?.commands.deleteColumn();
                }}
              >
                <Icon icon={Trash2Icon} size={14} />
                <span>열 삭제</span>
              </MenuItem>
            </Menu>
          </div>
        {/each}
      {/if}
    {/if}

    <NodeViewContentEditable as="tbody" />
  </table>

  {#if editor?.isEditable}
    <div
      class={cx(
        'group',
        css({
          position: 'absolute',
          zIndex: '10',
          left: '0',
          bottom: '0',
          right: '0',
          width: 'full',
          height: '18px',
          translate: 'auto',
          translateY: '[calc(100% + 5px)]',
        }),
      )}
      contenteditable={false}
    >
      <button
        class={center({
          width: 'full',
          height: 'full',
          borderWidth: '1px',
          borderRadius: '4px',
          textStyle: '14m',
          paddingX: '4px',
          paddingY: '2px',
          backgroundColor: 'surface.primary',
          display: isLastRowHovered ? 'flex' : 'none',
          _groupHover: {
            display: 'flex',
          },
          _hover: {
            backgroundColor: 'surface.secondary',
          },
        })}
        type="button"
        on:click={() => addRowAtEnd(node)}
      >
        <Icon icon={PlusIcon} size={14} />
      </button>
    </div>

    <div
      class={cx(
        'group',
        css({
          position: 'absolute',
          zIndex: '10',
          top: '0',
          right: '0',
          bottom: '0',
          width: '18px',
          height: 'full',
          translate: 'auto',
          translateX: '[calc(100% + 5px)]',
        }),
      )}
      contenteditable={false}
    >
      <button
        class={center({
          width: 'full',
          height: 'full',
          borderWidth: '1px',
          borderRadius: '4px',
          textStyle: '14m',
          paddingX: '4px',
          paddingY: '2px',
          backgroundColor: 'surface.primary',
          display: isLastColumnHovered ? 'flex' : 'none',
          _hover: {
            backgroundColor: 'surface.secondary',
          },
          _groupHover: {
            display: 'flex',
          },
        })}
        type="button"
        on:click={() => {
          addColumnAtEnd(node);
        }}
      >
        <Icon icon={PlusIcon} size={14} />
      </button>
    </div>

    <div
      class={cx(
        'group',
        css({
          position: 'absolute',
          zIndex: '10',
          right: '0',
          bottom: '0',
          size: '18px',
          translate: 'auto',
          translateX: '[calc(100% + 5px)]',
          translateY: '[calc(100% + 5px)]',
        }),
      )}
      contenteditable={false}
    >
      <button
        class={center({
          size: 'full',
          borderWidth: '1px',
          borderRadius: '4px',
          textStyle: '14m',
          paddingX: '4px',
          paddingY: '2px',
          backgroundColor: 'surface.primary',
          display: isLastRowHovered && isLastColumnHovered ? 'flex' : 'none',
          _hover: {
            backgroundColor: 'surface.secondary',
          },
          _groupHover: {
            display: 'flex',
          },
        })}
        type="button"
        on:click={() => {
          addRowAtEnd(node);
          addColumnAtEnd(node);
        }}
      >
        <Icon icon={PlusIcon} size={14} />
      </button>
    </div>
  {/if}
</NodeView>
