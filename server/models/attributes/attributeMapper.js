
const { DataTypes } = require('sequelize');

module.exports = { 
    mapAttributes: function mapAttributes(attributes) {
        const mappedAttributes = {};
        for (const [attrName, attrConfig] of Object.entries(attributes)) {
            const mappedAttribute = {
                type: DataTypes[attrConfig.type],
                allowNull: attrConfig.allowNull
            };
        
            if (attrConfig.allowNull !== undefined) {
                mappedAttribute.allowNull = attrConfig.allowNull;
            }
        
            if (attrConfig.unique !== undefined) {
                mappedAttribute.unique = attrConfig.unique;
            }
            
            mappedAttributes[attrName] = mappedAttribute;
        }
        return mappedAttributes;
    }
};

// {
//     Questions: [
//         {
//             question: "I am a good person.",
//             questionType: "agree",
//             questionId: "questionOneAgree",
//             options: [
//                 {
//                     option: "Strongly Disagree",
//                     value: 1
//                 },
//                 {
//                     option: "Disagree",
//                     value: 2
//                 }
//             ]
//         }   
//     ]
// }
