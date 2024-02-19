const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and Punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

const typeDefs = `
    type Books {
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
      id: String!
    }

    type Authors {
      name: String!
      bookCount: Int!
      born: Int
    }

    type Query {
      bookCount: Int!
      authorCount: Int!
      allBooks(
        author: String
        genre: String
        ): [Books!]!
      allAuthors: [Authors!]!
    }

    type Mutation {
      addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
      ) : Books
      editAuthor(
        name: String!
        setBornTo: Int!
      ) : Authors
    }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => {
      const uniqueAuthors = new Set(books.map(book => book.author))
      return uniqueAuthors.size
    },
    allBooks: (root, args) => {
      if (args.author) {
        return books.filter(book => book.author === args.author)
      } else if (args.genre) {
        return books.filter(book => book.genres.some(genre => args.genre.includes(genre)))
      } else {
        return books
      }
    },
    allAuthors: () => {
      const authorsAndTheirBookCount = authors.map(author => {
        const bookCount = books.filter(book => book.author === author.name).length;
        return { name: author.name, born: author.born, bookCount };
      });
      return authorsAndTheirBookCount;
    }
  },
  Mutation: {
    addBook: (root, args) => {
      const authorExists = authors.some(author => author.name === args.author)

      if(!authorExists) {
        const newAuthor = { name: args.author, id: uuid()}
        authors.push(newAuthor)
      }

      const newBook = { ...args, id: uuid()}
      books.push(newBook)
      return newBook
    },
    editAuthor: (root, args) => {
      const authorQuery = authors.find(author => author.name === args.name)

      if (!authorQuery) {
        return null
      }

      const authorToUpdate = { ...authorQuery, born: args.setBornTo }
      authors = authors.map(author => {
        author.name === args.name ? authorToUpdate : author
      })
      return authorToUpdate
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
