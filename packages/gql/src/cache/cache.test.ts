import { firstValueFrom } from 'rxjs';
import { beforeEach, expect, test, vi } from 'vitest';
import { buildStoreSchema } from '../../tests/utils';
import { Cache } from './cache';
import { entityLinkKey, rootFieldKey } from './const';

let cache: Cache;

beforeEach(() => {
  cache = new Cache();
});

test('쓰고 읽기', () => {
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
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
    },
  };

  cache.write(schema, variables, data);
  const result = cache.read(schema, variables);

  expect(result).toStrictEqual(data);
});

test('pathSubject.next 호출 확인', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subjectNextSpy = vi.spyOn((cache as any).pathSubject, 'next');

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
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
    },
  };

  cache.write(schema, variables, data);

  expect(subjectNextSpy).toHaveBeenNthCalledWith(1, ['Book:book1']);
  expect(subjectNextSpy).toHaveBeenNthCalledWith(2, [rootFieldKey, 'book@{"id":"book1"}']);

  cache.write(schema, variables, data);

  expect(subjectNextSpy).toHaveBeenNthCalledWith(3, ['Book:book1', '__typename']);
  expect(subjectNextSpy).toHaveBeenNthCalledWith(4, ['Book:book1', 'id']);
  expect(subjectNextSpy).toHaveBeenNthCalledWith(5, ['Book:book1', 'title']);
  expect(subjectNextSpy).toHaveBeenNthCalledWith(6, [rootFieldKey, 'book@{"id":"book1"}', entityLinkKey]);
});

test('observe 함수 첫 값 방출 확인', async () => {
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
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
    },
  };

  const observable = cache.observe(schema, variables);
  const promise = firstValueFrom(observable);

  cache.write(schema, variables, data);

  const result = await promise;

  expect(result).toStrictEqual(data);
});

test('observe 함수 단일 방출 확인', async () => {
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
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
    },
  };

  const callback = vi.fn();

  const observable = cache.observe(schema, variables);
  observable.subscribe((v) => callback(v));

  cache.write(schema, variables, data);

  await vi.waitFor(() => {
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(data);
  });
});

test('observe 함수 지속적 방출 확인 1', async () => {
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

  const data1 = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
    },
  };

  const data2 = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action 2',
    },
  };

  const callback = vi.fn();

  const observable = cache.observe(schema, variables);
  observable.subscribe((v) => callback(v));

  cache.write(schema, variables, data1);

  await vi.waitFor(() => {
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, data1);
  });

  cache.write(schema, variables, data2);

  await vi.waitFor(() => {
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(2, data2);
  });
});

test('observe 함수 지속적 방출 확인 2', async () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T {
      book {
        __typename
        id
        title
      }
    }
  `);

  const variables = {};

  const data1 = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
    },
  };

  const data2 = {
    book: {
      __typename: 'Book',
      id: 'book2',
      title: 'GraphQL in Action 2',
    },
  };

  const callback = vi.fn();

  const observable = cache.observe(schema, variables);
  observable.subscribe((v) => callback(v));

  cache.write(schema, variables, data1);

  await vi.waitFor(() => {
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, data1);
  });

  cache.write(schema, variables, data2);

  await vi.waitFor(() => {
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(2, data2);
  });
});
