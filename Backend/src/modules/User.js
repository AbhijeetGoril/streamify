import mongoose from "mongoose";

import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    default: ""
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePic: {
    type: String,
    default: ""
  },
  nativeLanguage: {
    type: String,
    default: ""
  },
  learningLanguage: {   // ✔️ fixed spelling
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  isOnboarded: {       // ✔️ fixed spelling
    type: Boolean,
    default: false
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, { timestamps: true });

userSchema.methods.matchPassword= async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password,)
}

// pre hook
userSchema.pre("save",async function(next){
  if( !this.isModified("password")) return next()
  try {
    const saltRounds = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, saltRounds);
    next()
  } catch (error) {
    next(error)
  }
})



const User=mongoose.model("User",userSchema)

export default User