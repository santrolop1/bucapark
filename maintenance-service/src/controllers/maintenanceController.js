const Maintenance = require('../models/Maintenance');

const createMaintenance = async (
  req,
  res
) => {

  try {

    const {
      incidentId,
      parkId,
      descripcion,
      operarioId,
      prioridad,
    } = req.body;

    const maintenance =
      await Maintenance.create({

        incidentId,
        parkId,
        descripcion,
        operarioId,
        prioridad,

        asignadoPor:
          req.user.userId,
      });

    res.status(201).json({

      success: true,

      message:
        'Tarea creada correctamente',

      data: maintenance,
    });

  } catch (error) {

    console.error(
      'Error creando tarea:',
      error.message
    );

    res.status(500).json({

      success: false,

      error:
        'Error interno del servidor',
    });
  }
};

const getMaintenance = async (
  req,
  res
) => {

  try {

    let query = {};

    if (
      req.user.rol ===
      'operario'
    ) {

      query.operarioId =
        req.user.userId;
    }

    const tasks =
      await Maintenance.find(
        query
      );

    res.json({

      success: true,

      data: tasks,
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error:
        error.message,
    });
  }
};

const updateMaintenanceStatus = async (
  req,
  res
) => {

  try {

    const {
      estado,
    } = req.body;

    const updateData = {
      estado,
    };

    if (
      estado ===
      'Completada'
    ) {

      updateData.fechaResolucion =
        new Date();
    }

    const maintenance =
      await Maintenance.findByIdAndUpdate(

        req.params.id,

        updateData,

        {
          new: true,
        }
      );

    if (!maintenance) {

      return res.status(404).json({

        success: false,

        error:
          'Tarea no encontrada',
      });
    }

    res.json({

      success: true,

      message:
        'Estado actualizado',

      data: maintenance,
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error:
        error.message,
    });
  }
};

module.exports = {

  createMaintenance,
  getMaintenance,
  updateMaintenanceStatus,
};