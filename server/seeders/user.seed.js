const { faker } = require('@faker-js/faker');
const { User } = require('../models/user.models.js');

exports.createUsers = async (numUsers) => {
    try {

        const usersPromise = [];

        for (let i = 0; i < numUsers; i++) {
            const tempUser = await User.create({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: "123321",
                bio: faker.lorem.sentence(10),
                avatar: {
                    public_id: faker.system.fileName(),
                    url: faker.image.avatar(),
                }
            });
            console.log(tempUser);
            usersPromise.push(tempUser);;
        }

        await Promise.all(usersPromise);

        console.log("Users created:", numUsers);
        process.exit(1);
    } catch (error) {
        console.log("UserSeed ERROR:", error);
        process.exit(1);
    }
};
