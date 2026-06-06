export const sendToken = (user, statusCode, res) => {
  const accessToken = user.accessToken();
  const refreshToken = user.generateRefreshToken();

  const baseOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    isEmailVerified: user.isEmailVerified,
    isProfileCompleted: user.isProfileCompleted,
  };

  return res
    .status(statusCode)
    .cookie("accessToken", accessToken, {
      ...baseOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...baseOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message: "Login successful.",
      user: safeUser,
    });
};
