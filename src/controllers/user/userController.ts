import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const getProfile = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      mobile: user.phone,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      address: user.address,
    });
  } catch (error: any) {
    console.error('Get Profile Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const updateProfile = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { name, firstName, lastName, email, address, avatar } = await req.json();

    await dbConnect();
    const user = await User.findById((session.user as any).id);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    
    // Update name by combining firstName and lastName or using provided name
    if (firstName || lastName) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    } else if (name) {
      user.name = name;
    }

    if (email) user.email = email;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        mobile: user.phone,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        address: user.address,
      },
    });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
