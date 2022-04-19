const { User } = require('../models')
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers={
    Query:{
        me: async(args, parent, context)=>{
            if(context.user){
                const userData = await User.findOne({_id: context.user._id})
                    .select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Could not login');
        }
    },
    Mutation:{
        addUser: async(parent, args)=>{
            const user = await User.create(args);
            const token = signToken(user);
            return{token, user};
        },
        
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
            throw new AuthenticationError('Invalid email');
            }
            const correctPass = await user.isCorrectPassword(password);
            if (!correctPass) {
            throw new AuthenticationError('Invalid password');
            }
            const token  =signToken(user);
            return {token, user};
        },
        
        saveBook: async(args, parent, context)=>{
            if(context.user){
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$push: {savedBooks: args}},
                    {new: true, runValidators: true}
                );
                return updatedUser;
            }
            throw new Error('Book was not added');
        },
        
        removeBook: async (parent, { bookId }, context) =>{
            if(context.user){
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: {bookId}}},
                    {new: true}
                );
                return updatedUser;
            }
            throw new AuthenticationError('Book was not deleted');
        }
    }
};

module.exports = resolvers;