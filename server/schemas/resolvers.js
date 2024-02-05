const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // Resolver for getting a single user by either their id or their username
    getSingleUser: async (_, { user, params }, context) => {
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
      });

      if (!foundUser) {
        throw new Error('Cannot find a usgit aer with this id!');
      }

      return foundUser;
    },
  },
  Mutation: {
    // Resolver for creating a user, signing a token, and sending it back
    createUser: async (_, { body }, context) => {
      const user = await User.create(body);

      if (!user) {
        throw new Error('Something is wrong!');
      }

      const token = signToken(user);
      return { token, user };
    },
    
    // Resolver for logging in a user, signing a token, and sending it back
    login: async (_, { body }, context) => {
      const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });

      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(body.password);

      if (!correctPw) {
        throw new Error('Wrong password!');
      }

      const token = signToken(user);
      return { token, user };
    },
    
    // Resolver for saving a book to a user's `savedBooks` field
    saveBook: async (_, { user, body }, context) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error('Failed to save the book.');
      }
    },

    // Resolver for removing a book from `savedBooks`
    deleteBook: async (_, { user, params }, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Couldn't find user with this id!");
      }

      return updatedUser;
    },
  },
};

module.exports = resolvers;
