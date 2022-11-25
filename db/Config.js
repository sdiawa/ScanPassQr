const bCrypt = require("bcrypt");
const {DataTypes, Sequelize} = require("sequelize");

// connection à la BD
class Config {
    User;
    sequelize;

    constructor() {
        if (process.env.DATABASE_URL) {
            if (process.env.TOKEN_KEY) {
                let match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

                this.sequelize = new Sequelize(match[5], match[1], match[2], {
                    logging: console.log,
                    port: match[4],
                    host: match[3],
                    pool: {
                        max: 1,
                        min: 0,
                        acquire: 30000,
                        idle: 10000
                    },
                    dialect: "postgres",
                    dialectOptions: {
                        ssl: {
                            require: true,
                            rejectUnauthorized: false // <<<<<<< YOU NEED THIS
                        }
                    },
                });
                this.User = this.sequelize.define('user', {
                    qrHashCode: {
                    type: DataTypes.STRING,
                        allowNull: false,
                        unique: true
                },
                    isValid: DataTypes.BOOLEAN,
                    lastCheckDate: DataTypes.DATE
                });
                (async () => {
                    console.log('Connecting to DB...');
                    await this.User.sync({logging: console.log})
                })();
            } else {
                console.error("Impossible de trouver la clé privée du token dans l'env TOKEN_KEY.");
            }
        } else {
            if (process.env.TOKEN_KEY)
                console.error("Impossible de trouver une BD Postgres dans l'env DATABASE_URL.");
            else
                console.error("Impossible de trouver la clé privée du token dans l'env TOKEN_KEY.");

        }
    }

    /**
     *
     * @desc Hash le mot de passe Bcrypt
     * @param password
     * @return {Promise<null|*>}
     */
    hashPassword = async (password) => {
        let passHash;
        try {
            passHash = await bCrypt.hashSync(password, 10)
        } catch (e) {
            return null;
        }
        return passHash;
    };

    /**
     *
     * @desc recherche un qrCode par le hash
     * @param qrHash
     * @return {Promise<T>|null|boolean}
     */
    checkValidQrHashCode = async (qrHash) => {
        if (this.User === undefined)
            return null;
        let user = await this.User.findOne({where: {qrHashCode: qrHash}}).catch(() => {
            return null;
        });
        if (user) {
            return user;
        }
        return false;

    };


    /**
     *
     * @desc Init 200  QR codes
     * @return {Promise<T>|null|boolean}
     */
    generate200Users = async () => {
        if (this.User === undefined)
            return false;
        let newUser = await this.User.findAndCountAll()
        if (newUser && newUser.count > 0)
            return false;
        const passPhrase = "DSK is the best";
        let users = [];
        for (let i = 1; i <= 200; i++) {
            let user = {id: null, qrHashCode: null, isValid: true, lastCheckDate: null};
            const genPass = await this.hashPassword(passPhrase + i);
            if (genPass === null)
                return false;
            user.id = i;
            user.qrHashCode = genPass;
            users.push(user)
        }
        this.User.bulkCreate(users).catch(() => {
            return false;
        });
        return true;
    };
}

const Bd = new Config();
module.exports = {Bd};
