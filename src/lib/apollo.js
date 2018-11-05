import { useState, useMemo } from 'react';

const userData = {
  '1': {
    firstName: 'Harry',
    lastName: 'Potter'
  }
};

const queries = {};

function getUser(id) {
  if (userData[id]) return userData[id];
  return { firstName: '', lastName: '' };
}

class Query {
  constructor(id) {
    this.id = id;
    this.loading = true;
  }

  async start() {
    this.started = true;
    return new Promise(resolve => {
      window.setTimeout(() => {
        this.loading = false;
        let user = window.localStorage.getItem(`user-${this.id}`);
        if (!user) {
          user = JSON.stringify(getUser(this.id));
          window.localStorage.setItem(`user-${this.id}`, user);
        }
        this.data = { user: JSON.parse(user) };
        resolve(this);
      }, 2000);
    });
  }

  getResult() {
    return {
      loading: this.loading,
      data: this.data,
      _id: this.id
    }
  }
}

class Mutation {
  constructor(variables) {
    this.variables = variables;
  }

  mutate(value) {
    this.loading = true;
    this.setResult(this.getResult());
    window.setTimeout(() => {
      this.loading = false;
      const user = { ...this.variables, ...value };
      window.localStorage.setItem(`user-${user.id}`, JSON.stringify(user));
      this.data = { user };
      this.setResult(this.getResult());
    }, 2000);
  }

  getResult() {
    return {
      loading: this.loading,
      data: this.data
    }
  }
}

export function useQuery({ variables }) {
  const [result, setResult] = useState({});
  let query = queries[variables.id];
  if (!query) {
    query = new Query(variables.id);
    queries[variables.id] = query;
  }

  if (query.getResult()._id !== result._id) setResult(query.getResult());

  if (!query.started) query.start().then(resolvedQuery => setResult(resolvedQuery.getResult()));

  return result;
}

export function useMutation({ variables }) {
  const mutation = useMemo(() => new Mutation(variables), [variables.id]);
  const [result, setResult] = useState(mutation.getResult());

  mutation.setResult = setResult;

  return [(...args) => mutation.mutate(...args), result];
}
