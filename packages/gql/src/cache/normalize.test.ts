import { expect, test } from 'vitest';
import { buildStoreSchema } from '../../tests/utils';
import { normalize } from './normalize';

test('nullable 필드 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!) {
      author(id: $authorId) {
        __typename
        id
        name
        optionalBooks {
          __typename
          id
          title
          isbn
          price
        }
        searchTerms
      }
    }
  `);

  const variables = { authorId: 'author1' };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: '홍길동',
      optionalBooks: [
        {
          __typename: 'Book',
          id: 'book1',
          title: '홍길동전',
          isbn: '978-89-954321-0-1',
          price: 15_000,
        },
        null,
        {
          __typename: 'Book',
          id: 'book2',
          title: '춘향전',
          isbn: '978-89-954321-0-2',
          price: 18_000,
        },
      ],
      searchTerms: ['홍길동', '조선', '의적'],
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "author@{"id":"author1"}": {
          "@link": "Author:author1",
        },
      },
      "Author:author1": {
        "__typename": "Author",
        "id": "author1",
        "name": "홍길동",
        "optionalBooks": [
          {
            "@link": "Book:book1",
          },
          null,
          {
            "@link": "Book:book2",
          },
        ],
        "searchTerms": [
          "홍길동",
          "조선",
          "의적",
        ],
      },
      "Book:book1": {
        "__typename": "Book",
        "id": "book1",
        "isbn": "978-89-954321-0-1",
        "price": 15000,
        "title": "홍길동전",
      },
      "Book:book2": {
        "__typename": "Book",
        "id": "book2",
        "isbn": "978-89-954321-0-2",
        "price": 18000,
        "title": "춘향전",
      },
    }
  `);
});

test('빈 리스트 필드 정규화', () => {
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
        }
      }
    }
  `);

  const variables = { authorId: 'author1' };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: 'Empty Author',
      books: [],
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "author@{"id":"author1"}": {
          "@link": "Author:author1",
        },
      },
      "Author:author1": {
        "__typename": "Author",
        "books": [],
        "id": "author1",
        "name": "Empty Author",
      },
    }
  `);
});

test('nullable 필드와 빈 리스트가 포함된 복잡한 쿼리 정규화', () => {
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
          isbn
          price
          publisher {
            __typename
            id
            name
          }
        }
        searchTerms
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
          isbn: '978-89-954321-0-1',
          price: 15_000,
          publisher: {
            __typename: 'Publisher',
            id: 'publisher1',
            name: '출판사 1',
          },
        },
        {
          __typename: 'Book',
          id: 'book2',
          title: '책 2',
          isbn: '978-89-954321-0-2',
          price: 18_000,
          publisher: null,
        },
      ],
      searchTerms: ['작가 1', '소설', '베스트셀러'],
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "author@{"id":"author1"}": {
          "@link": "Author:author1",
        },
      },
      "Author:author1": {
        "__typename": "Author",
        "books": [
          {
            "@link": "Book:book1",
          },
          {
            "@link": "Book:book2",
          },
        ],
        "id": "author1",
        "name": "작가 1",
        "searchTerms": [
          "작가 1",
          "소설",
          "베스트셀러",
        ],
      },
      "Book:book1": {
        "__typename": "Book",
        "id": "book1",
        "isbn": "978-89-954321-0-1",
        "price": 15000,
        "publisher": {
          "@link": "Publisher:publisher1",
        },
        "title": "책 1",
      },
      "Book:book2": {
        "__typename": "Book",
        "id": "book2",
        "isbn": "978-89-954321-0-2",
        "price": 18000,
        "publisher": null,
        "title": "책 2",
      },
      "Publisher:publisher1": {
        "__typename": "Publisher",
        "id": "publisher1",
        "name": "출판사 1",
      },
    }
  `);
});

test('인자가 있는 필드 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        isbn
        price
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      isbn: '978-1-61729-568-0',
      price: 49.99,
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "book@{"id":"book1"}": {
          "@link": "Book:book1",
        },
      },
      "Book:book1": {
        "__typename": "Book",
        "id": "book1",
        "isbn": "978-1-61729-568-0",
        "price": 49.99,
        "title": "GraphQL in Action",
      },
    }
  `);
});

test('복잡한 인자를 가진 필드 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($query: String!, $category: BookCategory) {
      searchBooks(query: $query, category: $category) {
        __typename
        id
        title
        isbn
        price
        category
      }
    }
  `);

  const variables = { query: 'GraphQL', category: 'SCIENCE' };
  const data = {
    searchBooks: [
      {
        __typename: 'Book',
        id: 'book1',
        title: 'GraphQL in Action',
        isbn: '978-1-61729-568-0',
        price: 49.99,
        category: 'SCIENCE',
      },
      {
        __typename: 'Book',
        id: 'book2',
        title: 'Learning GraphQL',
        isbn: '978-1-492-03071-3',
        price: 39.99,
        category: 'SCIENCE',
      },
    ],
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "searchBooks@{"category":"SCIENCE","query":"GraphQL"}": [
          {
            "@link": "Book:book1",
          },
          {
            "@link": "Book:book2",
          },
        ],
      },
      "Book:book1": {
        "__typename": "Book",
        "category": "SCIENCE",
        "id": "book1",
        "isbn": "978-1-61729-568-0",
        "price": 49.99,
        "title": "GraphQL in Action",
      },
      "Book:book2": {
        "__typename": "Book",
        "category": "SCIENCE",
        "id": "book2",
        "isbn": "978-1-492-03071-3",
        "price": 39.99,
        "title": "Learning GraphQL",
      },
    }
  `);
});

test('유니온 타입 필드 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($query: String!) {
      search(query: $query) {
        __typename
        ... on Book {
          id
          title
          isbn
        }
        ... on Author {
          id
          name
        }
        ... on Publisher {
          id
          name
        }
      }
    }
  `);

  const variables = { query: 'test' };
  const data = {
    search: [
      {
        __typename: 'Book',
        id: 'book1',
        title: 'Test Book',
        isbn: '978-1-23456-789-0',
      },
      {
        __typename: 'Author',
        id: 'author1',
        name: 'Test Author',
      },
      {
        __typename: 'Publisher',
        id: 'publisher1',
        name: 'Test Publisher',
      },
    ],
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "search@{"query":"test"}": [
          {
            "@link": "Book:book1",
          },
          {
            "@link": "Author:author1",
          },
          {
            "@link": "Publisher:publisher1",
          },
        ],
      },
      "Author:author1": {
        "__typename": "Author",
        "id": "author1",
        "name": "Test Author",
      },
      "Book:book1": {
        "__typename": "Book",
        "id": "book1",
        "isbn": "978-1-23456-789-0",
        "title": "Test Book",
      },
      "Publisher:publisher1": {
        "__typename": "Publisher",
        "id": "publisher1",
        "name": "Test Publisher",
      },
    }
  `);
});

test('복잡한 유니온 타입 필드 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($query: String!) {
      search(query: $query) {
        __typename
        ... on Book {
          id
          title
          isbn
          price
          author {
            __typename
            id
            name
          }
          publisher {
            __typename
            id
            name
          }
        }
        ... on Author {
          id
          name
          books {
            __typename
            id
            title
          }
        }
        ... on Publisher {
          id
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

  const variables = { query: 'test' };
  const data = {
    search: [
      {
        __typename: 'Book',
        id: 'book1',
        title: 'Test Book',
        isbn: '978-1-23456-789-0',
        price: 29.99,
        author: { __typename: 'Author', id: 'author1', name: 'Test Author' },
        publisher: { __typename: 'Publisher', id: 'publisher1', name: 'Test Publisher' },
      },
      {
        __typename: 'Author',
        id: 'author1',
        name: 'Test Author',
        books: [
          { __typename: 'Book', id: 'book1', title: 'Test Book' },
          { __typename: 'Book', id: 'book2', title: 'Another Test Book' },
        ],
      },
      {
        __typename: 'Publisher',
        id: 'publisher1',
        name: 'Test Publisher',
        books: [
          { __typename: 'Book', id: 'book1', title: 'Test Book' },
          { __typename: 'Book', id: 'book3', title: 'Third Test Book' },
        ],
      },
    ],
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "search@{"query":"test"}": [
          {
            "@link": "Book:book1",
          },
          {
            "@link": "Author:author1",
          },
          {
            "@link": "Publisher:publisher1",
          },
        ],
      },
      "Author:author1": {
        "__typename": "Author",
        "books": [
          {
            "@link": "Book:book1",
          },
          {
            "@link": "Book:book2",
          },
        ],
        "id": "author1",
        "name": "Test Author",
      },
      "Book:book1": {
        "__typename": "Book",
        "author": {
          "@link": "Author:author1",
        },
        "id": "book1",
        "isbn": "978-1-23456-789-0",
        "price": 29.99,
        "publisher": {
          "@link": "Publisher:publisher1",
        },
        "title": "Test Book",
      },
      "Book:book2": {
        "__typename": "Book",
        "id": "book2",
        "title": "Another Test Book",
      },
      "Book:book3": {
        "__typename": "Book",
        "id": "book3",
        "title": "Third Test Book",
      },
      "Publisher:publisher1": {
        "__typename": "Publisher",
        "books": [
          {
            "@link": "Book:book1",
          },
          {
            "@link": "Book:book3",
          },
        ],
        "id": "publisher1",
        "name": "Test Publisher",
      },
    }
  `);
});

test('인터페이스 타입 필드 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($nodeId: ID!) {
      node(id: $nodeId) {
        __typename
        id
        ... on Book {
          title
          isbn
        }
        ... on Author {
          name
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
      isbn: '978-1-61729-568-0',
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "node@{"id":"book1"}": {
          "@link": "Book:book1",
        },
      },
      "Book:book1": {
        "__typename": "Book",
        "id": "book1",
        "isbn": "978-1-61729-568-0",
        "title": "GraphQL in Action",
      },
    }
  `);
});

test('순환 참조가 있는 데이터 구조 정규화', () => {
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

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "author@{"id":"author1"}": {
          "@link": "Author:author1",
        },
      },
      "Author:author1": {
        "__typename": "Author",
        "books": [
          {
            "@link": "Book:book1",
          },
        ],
        "id": "author1",
        "name": "작가 1",
      },
      "Book:book1": {
        "__typename": "Book",
        "author": {
          "@link": "Author:author1",
        },
        "id": "book1",
        "title": "책 1",
      },
    }
  `);
});

test('여러 개의 최상위 필드를 가진 쿼리 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!, $authorId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
      }
      author(id: $authorId) {
        __typename
        id
        name
      }
      topRatedBooks(limit: 2) {
        __typename
        id
        title
      }
    }
  `);

  const variables = { bookId: 'book1', authorId: 'author1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
    },
    author: {
      __typename: 'Author',
      id: 'author1',
      name: 'Eve Waltz',
    },
    topRatedBooks: [
      {
        __typename: 'Book',
        id: 'book2',
        title: 'Learning GraphQL',
      },
      {
        __typename: 'Book',
        id: 'book3',
        title: 'GraphQL API Design',
      },
    ],
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "author@{"id":"author1"}": {
          "@link": "Author:author1",
        },
        "book@{"id":"book1"}": {
          "@link": "Book:book1",
        },
        "topRatedBooks@{"limit":"2"}": [
          {
            "@link": "Book:book2",
          },
          {
            "@link": "Book:book3",
          },
        ],
      },
      "Author:author1": {
        "__typename": "Author",
        "id": "author1",
        "name": "Eve Waltz",
      },
      "Book:book1": {
        "__typename": "Book",
        "id": "book1",
        "title": "GraphQL in Action",
      },
      "Book:book2": {
        "__typename": "Book",
        "id": "book2",
        "title": "Learning GraphQL",
      },
      "Book:book3": {
        "__typename": "Book",
        "id": "book3",
        "title": "GraphQL API Design",
      },
    }
  `);
});

test('중첩된 인라인 프래그먼트를 포함한 쿼리 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($nodeId: ID!) {
      node(id: $nodeId) {
        __typename
        ... on Book {
          id
          title
          author {
            __typename
            id
            name
            ... on Author {
              books {
                __typename
                id
                title
              }
            }
          }
        }
        ... on Author {
          id
          name
          books {
            __typename
            id
            ... on Book {
              title
              publisher {
                __typename
                id
                name
              }
            }
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
        books: [
          { __typename: 'Book', id: 'book1', title: 'GraphQL in Action' },
          { __typename: 'Book', id: 'book2', title: 'Learning GraphQL' },
        ],
      },
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "node@{"id":"book1"}": {
          "@link": "Book:book1",
        },
      },
      "Author:author1": {
        "__typename": "Author",
        "books": [
          {
            "@link": "Book:book1",
          },
          {
            "@link": "Book:book2",
          },
        ],
        "id": "author1",
        "name": "Eve Waltz",
      },
      "Book:book1": {
        "__typename": "Book",
        "author": {
          "@link": "Author:author1",
        },
        "id": "book1",
        "title": "GraphQL in Action",
      },
      "Book:book2": {
        "__typename": "Book",
        "id": "book2",
        "title": "Learning GraphQL",
      },
    }
  `);
});

test('여러 개의 인라인 프래그먼트와 프래그먼트 스프레드를 포함한 쿼리 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    fragment BookDetails on Book {
      __typename
      id
      isbn
      price
      category
    }

    fragment AuthorDetails on Author {
      __typename
      id
      searchTerms
    }

    query T($query: String!) {
      search(query: $query) {
        __typename
        ... on Book {
          __typename
          id
          title
          ...BookDetails
          author {
            __typename
            id
            name
            ...AuthorDetails
          }
        }
        ... on Author {
          __typename
          id
          name
          ...AuthorDetails
          books {
            __typename
            id
            title
            ...BookDetails
          }
        }
        ... on Publisher {
          __typename
          id
          name
          books {
            __typename
            id
            title
            ...BookDetails
          }
        }
      }
    }
  `);

  const variables = { query: 'GraphQL' };
  const data = {
    search: [
      {
        __typename: 'Book',
        id: 'book1',
        title: 'GraphQL in Action',
        isbn: '978-1-61729-568-0',
        price: 49.99,
        category: 'SCIENCE',
        author: {
          __typename: 'Author',
          id: 'author1',
          name: 'Eve Waltz',
          searchTerms: ['GraphQL', 'API', 'Web Development'],
        },
      },
      {
        __typename: 'Author',
        id: 'author2',
        name: 'Alex Banks',
        searchTerms: ['React', 'JavaScript', 'GraphQL'],
        books: [
          {
            __typename: 'Book',
            id: 'book2',
            title: 'Learning React',
            isbn: '978-1-4919-5421-9',
            price: 39.99,
            category: 'SCIENCE',
          },
        ],
      },
    ],
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "search@{"query":"GraphQL"}": [
          {
            "@link": "Book:book1",
          },
          {
            "@link": "Author:author2",
          },
        ],
      },
      "Author:author1": {
        "__typename": "Author",
        "id": "author1",
        "name": "Eve Waltz",
        "searchTerms": [
          "GraphQL",
          "API",
          "Web Development",
        ],
      },
      "Author:author2": {
        "__typename": "Author",
        "books": [
          {
            "@link": "Book:book2",
          },
        ],
        "id": "author2",
        "name": "Alex Banks",
        "searchTerms": [
          "React",
          "JavaScript",
          "GraphQL",
        ],
      },
      "Book:book1": {
        "__typename": "Book",
        "author": {
          "@link": "Author:author1",
        },
        "category": "SCIENCE",
        "id": "book1",
        "isbn": "978-1-61729-568-0",
        "price": 49.99,
        "title": "GraphQL in Action",
      },
      "Book:book2": {
        "__typename": "Book",
        "category": "SCIENCE",
        "id": "book2",
        "isbn": "978-1-4919-5421-9",
        "price": 39.99,
        "title": "Learning React",
      },
    }
  `);
});

test('뮤테이션 결과 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    mutation CreateBook($input: BookInput!) {
      createBook(input: $input) {
        __typename
        id
        title
        isbn
        price
        category
        author {
          __typename
          id
          name
        }
        publisher {
          __typename
          id
          name
        }
      }
    }
  `);

  const variables = {
    input: {
      title: 'New GraphQL Book',
      authorId: 'author1',
      publisherId: 'publisher1',
      publishDate: '2023-05-25',
      isbn: '978-1-23456-789-0',
      category: 'SCIENCE',
      price: 29.99,
    },
  };

  const data = {
    createBook: {
      __typename: 'Book',
      id: 'book4',
      title: 'New GraphQL Book',
      isbn: '978-1-23456-789-0',
      price: 29.99,
      category: 'SCIENCE',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'John Doe',
      },
      publisher: {
        __typename: 'Publisher',
        id: 'publisher1',
        name: 'Tech Books Inc.',
      },
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "Author:author1": {
        "__typename": "Author",
        "id": "author1",
        "name": "John Doe",
      },
      "Book:book4": {
        "__typename": "Book",
        "author": {
          "@link": "Author:author1",
        },
        "category": "SCIENCE",
        "id": "book4",
        "isbn": "978-1-23456-789-0",
        "price": 29.99,
        "publisher": {
          "@link": "Publisher:publisher1",
        },
        "title": "New GraphQL Book",
      },
      "Publisher:publisher1": {
        "__typename": "Publisher",
        "id": "publisher1",
        "name": "Tech Books Inc.",
      },
    }
  `);
});

test('복잡한 인자를 가진 쿼리 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!, $bookFilters: BookFilters) {
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
      minPrice: 20,
      maxPrice: 50,
      categories: ['SCIENCE', 'FICTION'],
    },
  };

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
          price: 39.99,
          category: 'SCIENCE',
        },
        {
          __typename: 'Book',
          id: 'book2',
          title: 'Sci-Fi Adventures',
          price: 24.99,
          category: 'FICTION',
        },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "author@{"id":"author1"}": {
          "@link": "Author:author1",
        },
      },
      "Author:author1": {
        "__typename": "Author",
        "books@{"filters":{"categories":["SCIENCE","FICTION"],"maxPrice":50,"minPrice":20}}": [
          {
            "@link": "Book:book1",
          },
          {
            "@link": "Book:book2",
          },
        ],
        "id": "author1",
        "name": "Jane Doe",
      },
      "Book:book1": {
        "__typename": "Book",
        "category": "SCIENCE",
        "id": "book1",
        "price": 39.99,
        "title": "GraphQL Mastery",
      },
      "Book:book2": {
        "__typename": "Book",
        "category": "FICTION",
        "id": "book2",
        "price": 24.99,
        "title": "Sci-Fi Adventures",
      },
    }
  `);
});

test('필드 별칭을 사용한 쿼리 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        originalAuthor: author {
          __typename
          id
          fullName: name
        }
        translatedAuthor: author {
          __typename
          id
          shortName: name
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
      originalAuthor: {
        __typename: 'Author',
        id: 'author1',
        fullName: 'Eve Waltz',
      },
      translatedAuthor: {
        __typename: 'Author',
        id: 'author1',
        shortName: 'E. Waltz',
      },
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "book@{"id":"book1"}": {
          "@link": "Book:book1",
        },
      },
      "Author:author1": {
        "__typename": "Author",
        "id": "author1",
        "name": "E. Waltz",
      },
      "Book:book1": {
        "__typename": "Book",
        "author": {
          "@link": "Author:author1",
        },
        "id": "book1",
        "title": "GraphQL in Action",
      },
    }
  `);
});

test('변수와 지시어를 사용한 쿼리 정규화', () => {
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

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "book@{"id":"book1"}": {
          "@link": "Book:book1",
        },
      },
      "Author:author1": {
        "__typename": "Author",
        "id": "author1",
        "name": "Eve Waltz",
      },
      "Book:book1": {
        "__typename": "Book",
        "author": {
          "@link": "Author:author1",
        },
        "id": "book1",
        "publisher": {
          "@link": "Publisher:publisher1",
        },
        "title": "GraphQL in Action",
      },
      "Publisher:publisher1": {
        "__typename": "Publisher",
        "id": "publisher1",
        "name": "Manning Publications",
      },
    }
  `);
});

test('중첩된 필드 별칭과 인라인 프래그먼트를 사용한 쿼리 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!) {
      author(id: $authorId) {
        __typename
        id
        name
        recentBooks: books(filters: { minPrice: 20 }) {
          __typename
          id
          ... on Book {
            bookTitle: title
            bookPrice: price
          }
        }
        oldBooks: books(filters: { maxPrice: 10 }) {
          __typename
          id
          ... on Book {
            bookName: title
            bookCost: price
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
      recentBooks: [
        {
          __typename: 'Book',
          id: 'book1',
          bookTitle: 'GraphQL Mastery',
          bookPrice: 39.99,
        },
      ],
      oldBooks: [
        {
          __typename: 'Book',
          id: 'book2',
          bookName: 'JavaScript Basics',
          bookCost: 9.99,
        },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "author@{"id":"author1"}": {
          "@link": "Author:author1",
        },
      },
      "Author:author1": {
        "__typename": "Author",
        "books@{"filters":{"maxPrice":"10"}}": [
          {
            "@link": "Book:book2",
          },
        ],
        "books@{"filters":{"minPrice":"20"}}": [
          {
            "@link": "Book:book1",
          },
        ],
        "id": "author1",
        "name": "Jane Doe",
      },
      "Book:book1": {
        "__typename": "Book",
        "id": "book1",
        "price": 39.99,
        "title": "GraphQL Mastery",
      },
      "Book:book2": {
        "__typename": "Book",
        "id": "book2",
        "price": 9.99,
        "title": "JavaScript Basics",
      },
    }
  `);
});

test('복잡한 인터페이스와 유니온 타입을 사용한 쿼리 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($nodeId: ID!, $searchQuery: String!) {
      node(id: $nodeId) {
        __typename
        ... on Book {
          id
          title
          reviews {
            __typename
            id
            rating
            reviewer
          }
        }
        ... on Author {
          id
          name
          books {
            __typename
            id
            title
          }
        }
      }
      search(query: $searchQuery) {
        __typename
        ... on Book {
          id
          title
          category
        }
        ... on Author {
          id
          name
          searchTerms
        }
        ... on Publisher {
          id
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

  const variables = { nodeId: 'book1', searchQuery: 'GraphQL' };
  const data = {
    node: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      reviews: [
        {
          __typename: 'Review',
          id: 'review1',
          rating: 5,
          reviewer: 'John',
        },
        {
          __typename: 'Review',
          id: 'review2',
          rating: 4,
          reviewer: 'Jane',
        },
      ],
    },
    search: [
      {
        __typename: 'Book',
        id: 'book2',
        title: 'Learning GraphQL',
        category: 'SCIENCE',
      },
      {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
        searchTerms: ['GraphQL', 'API', 'Web Development'],
      },
      {
        __typename: 'Publisher',
        id: 'publisher1',
        name: 'GraphQL Publications',
        books: [
          {
            __typename: 'Book',
            id: 'book3',
            title: 'GraphQL Schema Design',
          },
          {
            __typename: 'Book',
            id: 'book4',
            title: 'GraphQL Performance',
          },
        ],
      },
    ],
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "node@{"id":"book1"}": {
          "@link": "Book:book1",
        },
        "search@{"query":"GraphQL"}": [
          {
            "@link": "Book:book2",
          },
          {
            "@link": "Author:author1",
          },
          {
            "@link": "Publisher:publisher1",
          },
        ],
      },
      "Author:author1": {
        "__typename": "Author",
        "id": "author1",
        "name": "Eve Waltz",
        "searchTerms": [
          "GraphQL",
          "API",
          "Web Development",
        ],
      },
      "Book:book1": {
        "__typename": "Book",
        "id": "book1",
        "reviews": [
          {
            "@link": "Review:review1",
          },
          {
            "@link": "Review:review2",
          },
        ],
        "title": "GraphQL in Action",
      },
      "Book:book2": {
        "__typename": "Book",
        "category": "SCIENCE",
        "id": "book2",
        "title": "Learning GraphQL",
      },
      "Book:book3": {
        "__typename": "Book",
        "id": "book3",
        "title": "GraphQL Schema Design",
      },
      "Book:book4": {
        "__typename": "Book",
        "id": "book4",
        "title": "GraphQL Performance",
      },
      "Publisher:publisher1": {
        "__typename": "Publisher",
        "books": [
          {
            "@link": "Book:book3",
          },
          {
            "@link": "Book:book4",
          },
        ],
        "id": "publisher1",
        "name": "GraphQL Publications",
      },
      "Review:review1": {
        "__typename": "Review",
        "id": "review1",
        "rating": 5,
        "reviewer": "John",
      },
      "Review:review2": {
        "__typename": "Review",
        "id": "review2",
        "rating": 4,
        "reviewer": "Jane",
      },
    }
  `);
});

test('임베드된 타입 정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!, $publisherId: ID!) {
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
      publisher(id: $publisherId) {
        __typename
        id
        name
        address {
          __typename
          street
          city
          country
        }
      }
    }
  `);

  const variables = { bookId: 'book1', publisherId: 'publisher1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      dimensions: {
        __typename: 'Dimensions',
        width: 6.5,
        height: 9.2,
        depth: 1.1,
      },
    },
    publisher: {
      __typename: 'Publisher',
      id: 'publisher1',
      name: 'Manning Publications',
      address: {
        __typename: 'Address',
        street: '20 Baldwin Road',
        city: 'Shelter Island',
        country: 'United States',
      },
    },
  };

  const normalized = normalize(schema, variables, data);

  expect(normalized.data).toMatchInlineSnapshot(`
    {
      "@ROOT": {
        "book@{"id":"book1"}": {
          "@link": "Book:book1",
        },
        "publisher@{"id":"publisher1"}": {
          "@link": "Publisher:publisher1",
        },
      },
      "Book:book1": {
        "__typename": "Book",
        "dimensions": {
          "__typename": "Dimensions",
          "depth": 1.1,
          "height": 9.2,
          "width": 6.5,
        },
        "id": "book1",
        "title": "GraphQL in Action",
      },
      "Publisher:publisher1": {
        "__typename": "Publisher",
        "address": {
          "__typename": "Address",
          "city": "Shelter Island",
          "country": "United States",
          "street": "20 Baldwin Road",
        },
        "id": "publisher1",
        "name": "Manning Publications",
      },
    }
  `);
});
