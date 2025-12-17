package com.entrenemos.services;

import com.entrenemos.entity.Mensaje;

import java.util.List;

public interface MensajeService {
    Mensaje guardarMensaje(Mensaje mensaje);
    List<Mensaje> obtenerMensajes();
}


