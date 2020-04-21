import {
    Block,
    BlockDTO,
    Blocks,
    BlocksDTO,
    BlocksState,
    CheckboxBlock,
    HeaderBlock,
    PageBlock,
    TextBlock,
} from './blocks.model';
import { nanoid } from 'nanoid';

// Mappers

export const mapAbstractBlock = (baseBlock: Block): BlockDTO => ({
    ...baseBlock,
    createdAt: Number(baseBlock.createdAt),
    updatedAt: Number(baseBlock.updatedAt),
});
export const mapBlocks = (blocks: Blocks): BlocksDTO =>
    blocks.map(mapAbstractBlock);

export const mapAbstractBlockDTO = (blockDTO: BlockDTO): Block => ({
    ...blockDTO,
    createdAt: new Date(blockDTO.createdAt),
    updatedAt: new Date(blockDTO.updatedAt),
});
export const mapBlocksDTO = (blocksDTO: BlocksDTO): Blocks =>
    blocksDTO.map(mapAbstractBlockDTO);

// Factories

export const textBlockFactory = (options: Partial<Block> = {}): TextBlock => ({
    title: '',
    // We need to be able to only override ^
    ...options,
    id: nanoid(),
    type: 'text',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
});

export const checkboxBlockFactory = (
    options: Partial<Block> = {}
): CheckboxBlock => ({
    checked: false,
    title: '',
    // We need to be able to only override ^
    ...options,
    id: nanoid(),
    type: 'checkbox',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
});

export const headerBlockFactory = (
    options: Partial<Block> = {}
): HeaderBlock => ({
    size: 'h1',
    title: '',
    // We need to be able to only override ^
    ...options,
    id: nanoid(),
    type: 'header',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
});

export const pageBlockFactory = (options: Partial<Block> = {}): PageBlock => ({
    title: 'Untitled',
    // We need to be able to only override ^
    ...options,
    id: nanoid(),
    type: 'page',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
});

// State manipulations

export const _updateStateBlock = (state: BlocksState, target: Block) =>
    state.map((block) => (block.id === target.id ? target : block));

export const _pushStateBlock = ({
    state,
    target,
}: {
    state: BlocksState;
    target: Block;
}) => [...state, target];

export const _replaceStateBlock = ({
    state,
    target,
    source,
}: {
    state: BlocksState;
    target: Block;
    source: Block;
}) => state.map((item) => (item.id === target.id ? source : item));

export const _deleteStateBlock = ({
    state,
    target,
}: {
    state: BlocksState;
    target: Block;
}) => state.filter((block) => block.id !== target.id);

// Children manipulations

export const _deleteBlockChild = (parent: Block, target: Block) => {
    return {
        ...parent,
        children: parent.children.filter((child) => child !== target.id),
    };
};

export const _pushBlockChild = ({
    target,
    parent,
}: {
    parent: Block;
    target: Block;
}) => {
    return {
        ...parent,
        children: [...parent.children, target.id],
    };
};

export const _insertBlockChild = ({
    parent,
    target,
    position,
}: {
    parent: Block;
    target: Block;
    position: number;
}) => {
    return {
        ...parent,
        children: parent.children.reduce(
            (acc, cur, index) =>
                index === position ? [...acc, cur, target.id] : [...acc, cur],
            []
        ),
    };
};

export const _replaceBlockChild = ({
    parent,
    target,
    source,
}: {
    parent: Block;
    target: Block;
    source: Block;
}) => ({
    ...parent,
    children: parent.children.map((child) =>
        child === target.id ? source.id : child
    ),
});

// Other utils

export const blockFactoryStrategy = (type: Block['type']) => {
    switch (type) {
        case 'checkbox':
            return checkboxBlockFactory;
        case 'header':
            return headerBlockFactory;
        case 'page':
            return pageBlockFactory;
        default:
            return textBlockFactory;
    }
};

export const _pushBlock = ({
    state,
    parent,
    target,
}: {
    state: BlocksState;
    parent: Block;
    target: Block;
}) => {
    const updatedState = _pushStateBlock({ state, target });
    const updatedParent = _pushBlockChild({ parent, target });
    return _updateStateBlock(updatedState, updatedParent);
};

export const _insertBlock = ({
    state,
    parent,
    target,
    position,
}: {
    state: BlocksState;
    target: Block;
    parent: Block;
    position: number;
}) => {
    const updatedState = _pushStateBlock({ state, target });
    const updatedParent = _insertBlockChild({ parent, target, position });
    return _updateStateBlock(updatedState, updatedParent);
};

export const _deleteBlock = ({
    state,
    parent,
    target,
}: {
    state: BlocksState;
    parent: Block;
    target: Block;
}) => {
    const updatedState = _deleteStateBlock({
        state,
        target,
    });
    const updatedParent = _deleteBlockChild(parent, target);
    return _updateStateBlock(updatedState, updatedParent);
};

export const _convertBlockTo = ({
    state,
    parent,
    target,
    type,
    options,
}: {
    state: BlocksState;
    parent: Block;
    target: Block;
    type: Block['type'];
    options?: Partial<Block>;
}) => {
    const blockFactory = blockFactoryStrategy(type);
    const source = blockFactory(options);

    const stateWithoutTarget = _replaceStateBlock({
        state,
        target,
        source,
    });
    const parentWithReplacedTarget = _replaceBlockChild({
        parent,
        target,
        source,
    });
    return _updateStateBlock(stateWithoutTarget, parentWithReplacedTarget);
};
