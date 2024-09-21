const sendToken=(user,res,statusCode)=>{
    const token=user.getJwtToken();
    const options={
        httpOnly:true
    }
    //save in cookie
    res.status(statusCode).cookie("token",token,options).json({
        success:true,
        user,
        token
    })
}
module.exports=sendToken;