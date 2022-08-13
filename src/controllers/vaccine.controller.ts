import { Response } from 'express';

import { VaccineInterfaceController } from '@interfaces/vaccine.interface';
import { TypedRequest, VaccineDocument } from '@interfaces/root';

import VaccineSchema from '@models/vaccine.schema';
import VaccineLotSchema from '@models/vaccineLot.schema';
import UserVaccineSchema from '@models/userVaccine.schema';

class VaccineController extends VaccineInterfaceController {
  public async create(
    req: TypedRequest<VaccineDocument>,
    res: Response
  ): Promise<void> {
    try {
      const newVaccine = new VaccineSchema({
        name: req.body.name,
      });

      const savedVaccine = await newVaccine.save();
      savedVaccine._doc.quantity = 0;
      savedVaccine._doc.vaccinated = 0;
      savedVaccine._doc.vaccineLot = [];

      res.status(201).json(savedVaccine);

      return;
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async delete(
    req: TypedRequest<VaccineDocument>,
    res: Response
  ): Promise<void> {
    try {
      await VaccineLotSchema.deleteMany({ vaccine: req.params.id });
      await UserVaccineSchema.deleteMany({ vaccine: req.params.id });
      await VaccineSchema.findByIdAndDelete(req.params.id);

      res.status(200).json({ message: 'Deleted successfully' });
      return;
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async getAllVaccine(
    _req: TypedRequest<VaccineDocument>,
    res: Response
  ): Promise<void> {
    try {
      const list = await VaccineSchema.find({}).sort('-createdAt');

      for (const vaccine of list) {
        const vaccineLots = await VaccineLotSchema.find({
          vaccine: (await vaccine)._id,
        });

        vaccine._doc.quantity = vaccineLots.reduce(
          (total, item) => total + Number(item.quantity),
          0
        );
        vaccine._doc.vaccinated = vaccineLots.reduce(
          (total, item) => total + Number(item.vaccinated),
          0
        );
        vaccine._doc.vaccineLot = vaccineLots;
      }

      res.status(200).json(list);
      return;
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async getSingleVaccine(
    req: TypedRequest<VaccineDocument>,
    res: Response
  ): Promise<void> {
    try {
      const vaccine = (await VaccineSchema.findById(
        req.params.id
      )) as VaccineDocument;
      const vaccineLots = await VaccineLotSchema.find({ vaccine: vaccine._id });

      vaccine._doc.quantity = vaccineLots.reduce(
        (total, item) => total + Number(item.quantity),
        0
      );
      vaccine._doc.vaccinated = vaccineLots.reduce(
        (total, item) => total + Number(item.vaccinated),
        0
      );
      vaccine._doc.vaccineLot = vaccineLots;

      res.status(200).json(vaccine);

      return;
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async update(
    req: TypedRequest<VaccineDocument>,
    res: Response
  ): Promise<void> {
    try {
      const vaccine = await VaccineSchema.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      res
        .status(200)
        .json({ message: 'Request to update has been granted!', vaccine });

      return;
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export const vaccineController = new VaccineController();