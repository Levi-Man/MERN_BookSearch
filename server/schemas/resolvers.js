const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {
    // Resolver for getting a single user by either their id or their username
    me: async (parent, args, context) => {
      if (context.user) {
        const foundUser = await User.findOne({
          _id: context.user._id
        });
      }
      throw new AuthenticationError('Cannot find a user with this id!');
    },
  },
  Mutation: {
    // Resolver for creating a user, signing a token, and sending it back
    addUser: async (parent, { username, email, password }, context) => {
      const user = await User.create({ username, email, password });

      if (!user) {
        throw new AuthenticationError('Something is wrong!');
      }

      const token = signToken(user);
      return { token, user };
    },

    // Resolver for logging in a user, signing a token, and sending it back
    login: async (parent, { email, password }, context) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(body.password);

      if (!correctPw) {
        throw new AuthenticationError('Wrong password!');
      }

      const token = signToken(user);
      return { token, user };
    },

    // Resolver for saving a book to a user's `savedBooks` field
    saveBook: async (_, { input }, context) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new AuthenticationError('Failed to save the book.');
      }
    },

    // Resolver for removing a book from `savedBooks`
    removeBook: async (_, { user, params }, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new AuthenticationError("Couldn't find user with this id!");
      }

      return updatedUser;
    },
  },
};

module.exports = resolvers;
