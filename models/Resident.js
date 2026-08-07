import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Resident = sequelize.define("Resident", {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // ⬇ NEW FIELDS FROM YOUR FORM ⬇
  sitioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  occupancy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  monthlyIncome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maritalStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  educationLevel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numChildren: {
    type: DataTypes.INTEGER,
    allowNull: false,   // ← This prevents your “Please fill in numberOfChildren” error
  },

  // Optional: assigned BHW
  assignedBHW: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  }
}, {
  tableName: "residents",
  freezeTableName: true
});


export { sequelize };
