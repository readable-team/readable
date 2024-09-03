import { expect, test } from 'vitest';
import { buildStoreSchema } from '../../tests/utils';
import { rootFieldKey } from './const';
import { denormalize } from './denormalize';
import { normalize } from './normalize';

test('기본 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        author {
          __typename
          id
          name
        }
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "book@{"id":"book1"}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "author",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
    ]
  `);
});

test('중첩 객체와 리스트 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!) {
      author(id: $authorId) {
        __typename
        id
        name
        books {
          __typename
          id
          title
          reviews {
            __typename
            id
            comment
            rating
          }
        }
      }
    }
  `);

  const variables = { authorId: 'author1' };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: 'Jane Doe',
      books: [
        {
          __typename: 'Book',
          id: 'book1',
          title: 'GraphQL Mastery',
          reviews: [
            { __typename: 'Review', id: 'review1', comment: 'Great book!', rating: 5 },
            { __typename: 'Review', id: 'review2', comment: 'Very informative', rating: 4 },
          ],
        },
        {
          __typename: 'Book',
          id: 'book2',
          title: 'Advanced TypeScript',
          reviews: [{ __typename: 'Review', id: 'review3', comment: 'Excellent resource', rating: 5 }],
        },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "author@{"id":"author1"}",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
      [
        "Author:author1",
        "books",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "reviews",
        "@link",
      ],
      [
        "Review:review1",
        "__typename",
      ],
      [
        "Review:review1",
        "id",
      ],
      [
        "Review:review1",
        "comment",
      ],
      [
        "Review:review1",
        "rating",
      ],
      [
        "Review:review2",
        "__typename",
      ],
      [
        "Review:review2",
        "id",
      ],
      [
        "Review:review2",
        "comment",
      ],
      [
        "Review:review2",
        "rating",
      ],
      [
        "Book:book2",
        "__typename",
      ],
      [
        "Book:book2",
        "id",
      ],
      [
        "Book:book2",
        "title",
      ],
      [
        "Book:book2",
        "reviews",
        "@link",
      ],
      [
        "Review:review3",
        "__typename",
      ],
      [
        "Review:review3",
        "id",
      ],
      [
        "Review:review3",
        "comment",
      ],
      [
        "Review:review3",
        "rating",
      ],
    ]
  `);
});

test('프래그먼트와 인라인 프래그먼트 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    fragment BookDetails on Book {
      isbn
      publishDate
    }

    query T($searchQuery: String!) {
      search(query: $searchQuery) {
        __typename
        ... on Book {
          id
          title
          ...BookDetails
        }
        ... on Author {
          id
          name
          searchTerms
        }
      }
    }
  `);

  const variables = { searchQuery: 'GraphQL' };
  const data = {
    search: [
      {
        __typename: 'Book',
        id: 'book1',
        title: 'GraphQL in Action',
        isbn: '978-1617295317',
        publishDate: '2021-03-30',
      },
      {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
        searchTerms: ['GraphQL', 'API', 'Web Development'],
      },
    ],
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "search@{"query":"GraphQL"}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "isbn",
      ],
      [
        "Book:book1",
        "publishDate",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
      [
        "Author:author1",
        "searchTerms",
      ],
    ]
  `);
});

test('순환 참조 데이터 구조 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!) {
      author(id: $authorId) {
        __typename
        id
        name
        books {
          __typename
          id
          title
          author {
            __typename
            id
            name
          }
        }
      }
    }
  `);

  const variables = { authorId: 'author1' };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: '작가 1',
      books: [
        {
          __typename: 'Book',
          id: 'book1',
          title: '책 1',
          author: {
            __typename: 'Author',
            id: 'author1',
            name: '작가 1',
          },
        },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "author@{"id":"author1"}",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
      [
        "Author:author1",
        "books",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "author",
        "@link",
      ],
    ]
  `);
});

test('nullable 필드와 빈 리스트 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!) {
      author(id: $authorId) {
        __typename
        id
        name
        books {
          __typename
          id
          title
          publisher {
            __typename
            id
            name
          }
        }
      }
    }
  `);

  const variables = { authorId: 'author1' };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: '작가 1',
      books: [
        {
          __typename: 'Book',
          id: 'book1',
          title: '책 1',
          publisher: null,
        },
        {
          __typename: 'Book',
          id: 'book2',
          title: '책 2',
          publisher: {
            __typename: 'Publisher',
            id: 'publisher1',
            name: '출판사 1',
          },
        },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "author@{"id":"author1"}",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
      [
        "Author:author1",
        "books",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "publisher",
      ],
      [
        "Book:book2",
        "__typename",
      ],
      [
        "Book:book2",
        "id",
      ],
      [
        "Book:book2",
        "title",
      ],
      [
        "Book:book2",
        "publisher",
        "@link",
      ],
      [
        "Publisher:publisher1",
        "__typename",
      ],
      [
        "Publisher:publisher1",
        "id",
      ],
      [
        "Publisher:publisher1",
        "name",
      ],
    ]
  `);
});

test('인자가 있는 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!, $bookLimit: Int!) {
      author(id: $authorId) {
        __typename
        id
        name
        books(limit: $bookLimit) {
          __typename
          id
          title
        }
      }
    }
  `);

  const variables = { authorId: 'author1', bookLimit: 2 };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: '작가 1',
      books: [
        { __typename: 'Book', id: 'book1', title: '책 1' },
        { __typename: 'Book', id: 'book2', title: '책 2' },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "author@{"id":"author1"}",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
      [
        "Author:author1",
        "books@{"limit":2}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book2",
        "__typename",
      ],
      [
        "Book:book2",
        "id",
      ],
      [
        "Book:book2",
        "title",
      ],
    ]
  `);
});

test('복잡한 인자와 변수를 사용한 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!, $bookFilters: BookFilters!) {
      author(id: $authorId) {
        __typename
        id
        name
        books(filters: $bookFilters) {
          __typename
          id
          title
          price
          category
        }
      }
    }
  `);

  const variables = {
    authorId: 'author1',
    bookFilters: {
      minPrice: 10,
      maxPrice: 50,
      categories: ['FICTION', 'SCIENCE'],
    },
  };

  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: 'Jane Doe',
      books: [
        { __typename: 'Book', id: 'book1', title: 'GraphQL Mastery', price: 39.99, category: 'SCIENCE' },
        { __typename: 'Book', id: 'book2', title: 'Sci-Fi Adventures', price: 29.99, category: 'FICTION' },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "author@{"id":"author1"}",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
      [
        "Author:author1",
        "books@{"filters":{"categories":["FICTION","SCIENCE"],"maxPrice":50,"minPrice":10}}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "price",
      ],
      [
        "Book:book1",
        "category",
      ],
      [
        "Book:book2",
        "__typename",
      ],
      [
        "Book:book2",
        "id",
      ],
      [
        "Book:book2",
        "title",
      ],
      [
        "Book:book2",
        "price",
      ],
      [
        "Book:book2",
        "category",
      ],
    ]
  `);
});

test('부분적으로 누락된 데이터 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        author {
          __typename
          id
          name
          books {
            __typename
            id
            title
          }
        }
        publisher {
          __typename
          id
          name
        }
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
        books: [
          { __typename: 'Book', id: 'book1', title: 'GraphQL in Action' },
          { __typename: 'Book', id: 'book2', title: 'GraphQL Advanced' },
        ],
      },
      publisher: {
        __typename: 'Publisher',
        id: 'publisher1',
        name: 'Tech Books',
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalized: any = normalize(schema, variables, data);

  delete normalized['Book:book2'].title;
  delete normalized['Publisher:publisher1'].name;

  const denormalized = denormalize(schema, variables, normalized);

  const expected = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
        books: [
          { __typename: 'Book', id: 'book1', title: 'GraphQL in Action' },
          { __typename: 'Book', id: 'book2', title: undefined },
        ],
      },
      publisher: {
        __typename: 'Publisher',
        id: 'publisher1',
        name: undefined,
      },
    },
  };

  expect(denormalized.data).toStrictEqual(expected);
  expect(denormalized.partial).toBe(true);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "book@{"id":"book1"}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "author",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
      [
        "Author:author1",
        "books",
        "@link",
      ],
      [
        "Book:book2",
        "__typename",
      ],
      [
        "Book:book2",
        "id",
      ],
      [
        "Book:book2",
        "title",
      ],
      [
        "Book:book1",
        "publisher",
        "@link",
      ],
      [
        "Publisher:publisher1",
        "__typename",
      ],
      [
        "Publisher:publisher1",
        "id",
      ],
      [
        "Publisher:publisher1",
        "name",
      ],
    ]
  `);
});

test('별칭을 사용한 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        customTitle: title
        author {
          __typename
          id
          name
          customName: name
        }
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      customTitle: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
        customName: 'Eve Waltz',
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "book@{"id":"book1"}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "author",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
    ]
  `);
});

test('인터페이스 타입 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($nodeId: ID!) {
      node(id: $nodeId) {
        __typename
        id
        ... on Book {
          title
          author {
            __typename
            id
            name
          }
        }
        ... on Author {
          name
          books {
            __typename
            id
            title
          }
        }
      }
    }
  `);

  const variables = { nodeId: 'book1' };
  const data = {
    node: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "node@{"id":"book1"}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "author",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
    ]
  `);
});

test('변수와 지시어를 사용한 쿼리 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!, $includeAuthor: Boolean!, $skipPublisher: Boolean!) {
      book(id: $bookId) {
        __typename
        id
        title
        author @include(if: $includeAuthor) {
          __typename
          id
          name
        }
        publisher @skip(if: $skipPublisher) {
          __typename
          id
          name
        }
      }
    }
  `);

  const variables = { bookId: 'book1', includeAuthor: true, skipPublisher: false };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
      },
      publisher: {
        __typename: 'Publisher',
        id: 'publisher1',
        name: 'Manning Publications',
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "book@{"id":"book1"}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "author",
        "@link",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
      [
        "Book:book1",
        "publisher",
        "@link",
      ],
      [
        "Publisher:publisher1",
        "__typename",
      ],
      [
        "Publisher:publisher1",
        "id",
      ],
      [
        "Publisher:publisher1",
        "name",
      ],
    ]
  `);
});

test('유니언 타입 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($searchQuery: String!) {
      search(query: $searchQuery) {
        __typename
        ... on Book {
          id
          title
        }
        ... on Author {
          id
          name
        }
      }
    }
  `);

  const variables = { searchQuery: 'GraphQL' };
  const data = {
    search: [
      {
        __typename: 'Book',
        id: 'book1',
        title: 'GraphQL in Action',
      },
      {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
      },
    ],
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "search@{"query":"GraphQL"}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Author:author1",
        "__typename",
      ],
      [
        "Author:author1",
        "id",
      ],
      [
        "Author:author1",
        "name",
      ],
    ]
  `);
});

test('임베디드 타입 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        dimensions {
          __typename
          width
          height
          depth
        }
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      dimensions: {
        __typename: 'Dimensions',
        width: 152.4,
        height: 228.6,
        depth: 25.4,
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "book@{"id":"book1"}",
        "@link",
      ],
      [
        "Book:book1",
        "__typename",
      ],
      [
        "Book:book1",
        "id",
      ],
      [
        "Book:book1",
        "title",
      ],
      [
        "Book:book1",
        "dimensions",
        "__typename",
      ],
      [
        "Book:book1",
        "dimensions",
        "width",
      ],
      [
        "Book:book1",
        "dimensions",
        "height",
      ],
      [
        "Book:book1",
        "dimensions",
        "depth",
      ],
    ]
  `);
});

test('루트 필드 누락 시 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const storage = {
    [rootFieldKey]: {},
    'Book:book1': {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
    },
  };

  const denormalized = denormalize(schema, variables, storage);

  expect(denormalized.data).toStrictEqual({ book: undefined });
  expect(denormalized.partial).toBe(true);

  expect(denormalized.paths).toMatchInlineSnapshot(`
    [
      [
        "@ROOT",
        "book@{"id":"book1"}",
      ],
    ]
  `);
});
