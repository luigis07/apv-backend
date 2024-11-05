import express from "express";
import { 
    agregarPaciente, 
    obtenerPacientes, 
    obtenerPaciente, 
    actualizarPaciente, 
    eliminarPaciente 
} from "../controllers/pacienteController.js";

import checkOut from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(checkOut, agregarPaciente)
    .get(checkOut, obtenerPacientes);

router
    .route('/:id')
    .get(checkOut, obtenerPaciente)
    .put(checkOut, actualizarPaciente)
    .delete(checkOut, eliminarPaciente)

export default router;