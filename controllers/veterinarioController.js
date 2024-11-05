import Veterinario from "../models/Veterinario.js";
import generarJWT from "../utils/generarJWT.js";
import generarId from "../utils/generarId.js";
import emailRegistro from '../utils/emailRegistro.js';
import emailOlvidePassword from "../utils/emailOlvidePassword.js";

const registrar = async (req, res) => {
    const { email, nombre } = req.body;

    // Prever usuarios duplicados
    const existeUsuario = await Veterinario.findOne({ email });

    if(existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({ msg: error.message });
    }

    try {
        // Guardar un Nuevo Veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        // Enviar el email
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token,
        });

        res.json(veterinarioGuardado);
    } catch (error) {
        console.log(error);
    }
};

const perfil = (req, res) => {
    const { veterinario } = req;

    res.json( { veterinario });
};

const confirmar = async (req, res) => {
    const { token } = req.params

    const usuarioConfirmar = await Veterinario.findOne( {token} );
    
    if(!usuarioConfirmar) {
        const error = new Error('Token no valido')
        return res.status(404).json( {msg: error.message} )
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();
        res.json( {msg: 'Usuario confirmado Correctamente'} );
    } catch (error) {
        console.log(error);
    }
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;

    // Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email});
    if (!usuario) {
        const error = new Error("El Usuario no existe");
        return res.status(404).json({ msg: error.message });
    }
    // Comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error("Tu Cuenta no ha sido confirmada");
        return res.status(403).json({ msg: error.message });
    }

    // Revisar el password
    if( await usuario.comprobarPassword(password)) {
        // Autenticar
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),
        });
    } else {
        const error = new Error('El password es incorrecto');
        return res.status(403).json( {msg: error.message} );
    }

};

const olvidePassword = async (req, res) => {
    const { email } = req.body;
    
    const exiteVeterinario = await Veterinario.findOne({ email });
    if(!exiteVeterinario) {
        const error = new Error('El usuario no existe');
        return res.status(400).json({ msg: error.message });
    }

    try {
        exiteVeterinario.token = generarId();
        await exiteVeterinario.save();

        // Enviar email con instrucciones
        emailOlvidePassword({
            email, 
            nombre: exiteVeterinario.nombre,
            token: exiteVeterinario.token
        })

        res.json({ msg: 'Hemos enviado un email con las instrucciones' });
    } catch (error) {
        console.log(error);
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const tokenValido = await Veterinario.findOne({ token });

    if(tokenValido) {
        // El token es valido, el usuario existe
        res.json({ msg: 'Token valido y el usuario existe' });
    } else {
        const error = new Error('Token no valido');
        return res.status(400).json({ msg: error.message });
    }
}

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({ token })
    if(!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({ msg: error.message });
    }

    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({ msg: 'Password modificado correctamente' });
    } catch (error) {
        console.log(error);
    }
}

const actualizarPerfil = async (req, res) => {
        const veterinario = await Veterinario.findById(req.params.id);
        if (!veterinario) {
            const error = new Error("Hubo un error");
            return res.status(400).json({ msg: error.message });
        }

        const { email } = req.body;
        if (veterinario.email !== req.body.email) {
            const existeEmail = await Veterinario.findOne({ email });

            if (existeEmail) {
                const error = new Error("Ese email ya esta en uso");
                return res.status(400).json({ msg: error.message });
            }
        }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;

        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);
    } catch (error) {
        console.log(error);
    }
};

const actualizarPassword = async (req, res) => {
    // Leer los datos
    const { id } = req.veterinario;
    const { pwd_actual, pwd_nuevo } = req.body;

    // Comprobar que el veterinario exsite
    const veterinario = await Veterinario.findById(id);
    if (!veterinario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }

    // Comprobar su password
    if (await veterinario.comprobarPassword(pwd_actual)) {
        // Almacenar el nuevo password
    
        veterinario.password = pwd_nuevo;
        await veterinario.save();
        res.json({ msg: "Password Almacenado Correctamente" });
      } else {
        const error = new Error("El Password Actual es Incorrecto");
        return res.status(400).json({ msg: error.message });
      }

}

export {
    registrar, perfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword, actualizarPerfil, actualizarPassword
};