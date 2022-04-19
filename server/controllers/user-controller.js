// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');

module.exports = {
  // create user
  async createUser({ body }, res) {
    const user = await User.create(body);

    if (!user) {
      return res.status(400).json({ message: 'Could not create user' });
    }
    const token = signToken(user);
    res.json({ token, user });
  },
  // user login
  async login({ body }, res) {
    const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const correctPass = await user.isCorrectPassword(body.password);

    if (!correctPass) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    const token = signToken(user);
    res.json({ token, user });
  },
  // find one user
  async getSingleUser({ user = null, params }, res) {
    const singleUser = await User.findOne({
      $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
    });

    if (!singleUser) {
      return res.status(400).json({ message: 'User not found' });
    }
    res.json(singleUser);
  },
  // save a users book
  async saveBook({ user, body }, res) {
    console.log(user);
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: body } },
        { new: true, runValidators: true }
      );
      return res.json(updatedUser);
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  },
  // delete a book 
  async deleteBook({ user, params }, res) {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { savedBooks: { bookId: params.bookId } } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(updatedUser);
  },
};
