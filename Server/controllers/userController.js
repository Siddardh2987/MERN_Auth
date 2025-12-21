import userModel from '../models/userModel.js';

export const getUserData = async (req, res) => {
    try{
        const {userId} = req.body;
        console.log("..User Id :" , userId);
        const user = await userModel.findById(userId);
        console.log("..user",user);
        if(!user){
            return res.json({success:false,message: 'User Not Found.'});
        }

        return res.json({
            success:true,
            userData:{
                name:user.name,
                isAccountVerfied: user.isAccountVerified,
            }
        });

    }catch(error){
        return res.json({success:false,message: error.message + " userController Get User Data ."});
    }
}