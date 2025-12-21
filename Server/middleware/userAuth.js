import jwt from 'jsonwebtoken';
const userAuth = (req , res , next) => {
    console.log("Cookies: ", req.cookies);
    const {token} =req.cookies;

    if(!token){
        return res.json({success : false , message : "Unauthorized Access1. No Token"})
    }
    try{
        const tokenDecode = jwt.verify(token , process.env.JWT_SECRET);
        
        console.log("Decoded Token: ", tokenDecode);

        if(!tokenDecode.userId){
            return res.json({success : false , message : "Unauthorized Access2. No User Id"})
        }
        
        req.body.userId = tokenDecode.userId;
        console.log("User ID from token: ", tokenDecode.userId);
        
        next();
    }catch(error){
        return res.json({success : false , message : "Unauthorized Access3. Try-Catch"})
    }
}

export default userAuth;