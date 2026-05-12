import { NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Falta el código de autorización' }, { status: 400 });
    }

    // 1. Intercambiar el código por un token de acceso
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const { access_token, error: tokenError } = tokenResponse.data;

    if (tokenError) {
      console.error('Error getting GitHub access token:', tokenError);
      return NextResponse.json({ error: 'Error al obtener el token de GitHub' }, { status: 401 });
    }

    // 2. Obtener el perfil del usuario de GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const githubProfile = userResponse.data;

    // 3. Obtener el correo electrónico (a veces no viene en el perfil principal)
    let email = githubProfile.email;
    if (!email) {
      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const primaryEmail = emailsResponse.data.find((e: any) => e.primary);
      email = primaryEmail ? primaryEmail.email : null;
    }

    if (!email) {
      return NextResponse.json({ error: 'No se pudo obtener el correo de GitHub' }, { status: 400 });
    }

    // 4. Buscar o crear el usuario en la base de datos
    // Primero intentamos por githubId, luego por email para vincular cuentas
    let user = await prisma.user.findUnique({
      where: { githubId: githubProfile.id.toString() },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Vincular cuenta de GitHub a usuario existente
        user = await prisma.user.update({
          where: { id: user.id },
          data: { githubId: githubProfile.id.toString() },
        });
      } else {
        // Crear nuevo usuario
        user = await prisma.user.create({
          data: {
            email,
            name: githubProfile.name || githubProfile.login,
            githubId: githubProfile.id.toString(),
            avatarUrl: githubProfile.avatar_url,
            // La contraseña se queda nula (opcional en el esquema)
          },
        });
      }
    } else {
      // Actualizar info si es necesario
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: githubProfile.name || githubProfile.login,
          avatarUrl: githubProfile.avatar_url,
        },
      });
    }

    // 5. Generar nuestro JWT de la app
    const token = generateToken({ id: user.id, role: user.role });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Inicio de sesión con GitHub exitoso',
      user: userWithoutPassword,
      token,
    });

  } catch (error: any) {
    console.error('Error in GitHub auth route:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Error interno en la autenticación con GitHub' },
      { status: 500 }
    );
  }
}
