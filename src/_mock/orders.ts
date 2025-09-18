import { v4 as uuid } from 'uuid';

    
const orders = [
  {
    _id: uuid().substring(0, 8),
    number: uuid().substring(0, 8),
    cart: [
      {
        product:
        {
          name: 'Product name',
          reference: 'Product reference',
          barcode: 'Product barcode',
          article: 'Product article',
          description: 'Product description',
          client_ttc: 10,
          wholesaler_ttc: 40,
          category: 'HOMME',
          catalog: uuid().substring(0, 8),
          attachments: {
            _id: "string",
            fieldname: "string",
            originalname: "string",
            encoding: "string",
            mimetype: "string",
            size: "number",
            destination: "string",
            filename: "string",
            path: "string",
            buffer: "number",
            createdAt: new Date(),
            as: "PRODUCT"
          },
          link: "www.google.com",
          price: 3000,
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        quantity: 2,
        color: {
          name: "",
          hex: "#bf7db2",
          createdAt: new Date()
        }
      }
    ],
    createdBy: {
      firstname: "string",
      lastname: "string",
      name: "Abdelhamid Larachi",
      region: "Alger",
      tel: "556343570",
      email: 'abdelhamid@email.com',
      role: {
        code: "CLIENT",
        status: true
      },
      verified: true,
      enabled: true,
    },
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
]



export default orders;