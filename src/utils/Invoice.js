import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { fCurrency } from './formatNumber';

export default function InvoicePrint({ number, createdBy, cart, createdAt, total, deliveryFee, paymentMethod }, title) {

    var doc = new jsPDF();
    var logo = new Image();
    //var facture = new Image();

    doc.setFont("helvetica", 'normal');

    // set logo
    logo.src = '/static/logo.png';
    // set facture
    //facture.src = '/static/facture2.png';


    // set company header
    doc.addImage(logo, 'png', 15, 15, 60, 15);
    doc.setTextColor(231, 221, 252);
    doc.text(title, 167, 21, { align: 'center', baseline: 'middle' })
    doc.setTextColor(0, 0, 0);


    doc.setFontSize(10);
    doc.text('SARL EasyEats', 15, 40);
    doc.text('Lot Al Yasmine Ext n° 30 Draria 16000 Algerie', 15, 45);
    doc.text('+(213) 23 33 22 08 / 23 33 20 81', 15, 50);
    doc.text('andaloussia.info@gmail.com', 15, 55);

    doc.text('Registre: 16/01 - 1007947B 14', 15, 65);
    doc.text('AI: 16530408622', 15, 70);
    doc.text('NIF: 001416100794720', 15, 75);

    doc.line(15, 80, 80, 80); // horizontal line

    doc.text('Le ' + new Date(createdAt).toLocaleDateString(), 15, 85);
    doc.text('N° de commande', 15, 90);
    doc.setFont("helvetica", 'bold');
    doc.text("#" + number.toString(), 44, 90);
    doc.setFont("helvetica", 'normal');

    doc.text('Payment: ', 15, 95);
    doc.setFont("helvetica", 'bold');
    doc.text(paymentMethod == 'cash-on-delivery' ? 'Paiement à la livraions' : paymentMethod == 'credit-card' ? 'CIB / EDAHABIA' : 'Paiement à terme 21 jours', 32, 95);
    doc.setFont("helvetica", 'normal');

    // if order was made by client
    if (createdBy.role.code == "CLIENT") {

        // name
        doc.text(createdBy.name, 150, 40);
        // phone
        doc.text("+213 " + createdBy.tel.toString().replace(/.{3}/g, '$& '), 150, 45);

        // extract info
        const { wilaya, city, email, address } = createdBy;

        // email
        if (email) doc.text(email, 150, 50);
        // address
        const address_ = doc.splitTextToSize(`${wilaya}, ${city}, ${address || ""}`, 40);
        doc.text(150, 55, address_);

    }
    // if order was made by wholesaler
    else {
        // designation
        doc.text(createdBy.designation, 150, 40);


        // extract info
        const { wilaya, city, email, address, mobile1, tel, nif, imposition_article } = createdBy;

        // phone
        doc.text("+213 " + (mobile1 ? mobile1.toString().replace(/.{3}/g, '$& ') : "+213 " + tel.toString().replace(/.{3}/g, '$& ')), 150, 45);
        // email
        if (email) doc.text(email, 150, 50);

        const ifNoEmail = y => !email ? y -= 5 : y

        // address
        const address_ = doc.splitTextToSize(`${wilaya}, ${city}, ${address || ""}`, 40);
        doc.text(150, ifNoEmail(55), address_);

        //nif
        doc.text(`NIF: ${nif}`, 150, ifNoEmail(70));

        //imposition_article
        doc.text(`AI: ${imposition_article}`, 150, ifNoEmail(75));
    }



    // set products table
    let data = cart.map(({ product, quantity, price }) => {
        return [
            product.name,
            product.barcode,
            fCurrency(price),
            quantity.toString(),
            fCurrency(price * quantity)];
    });

    //-------Invoice Table ---------------------

    doc.autoTable(
        ['Produit', 'Code barre', 'Prix (DA)', 'Qte', 'Montant (DA)'],
        data,
        {
            startY: 100,
            styles: { halign: 'center' },
            headStyles: { fillColor: [124, 95, 240] },
            alternateRowStyles: { fillColor: [231, 215, 252] },
            tableLineColor: [124, 95, 240],
            tableLineWidth: 0.1,
        }
    )

    //-------Invoice Footer---------------------
    const startY = doc.autoTableEndPosY();

    doc.setFontSize(12);
    const role = createdBy.role.code
    doc.text(`Total ${role !== "CLIENT" && "TTC"} (DA)`, 160, startY + 10, { align: 'right' });
    if (role == "CLIENT") doc.text('Livraison (DA)', 160, startY + 15, { align: 'right' });

    doc.setFont("helvetica", 'bold');

    doc.text(fCurrency(total).toString(), 195, startY + 10, { align: 'right' });
    if (role == "CLIENT") doc.text(fCurrency(Number(deliveryFee)).toString(), 195, startY + 15, { align: 'right' });

    //doc.line(135, startY + 12, 190, startY + 12); // horizontal line

    if (role == "CLIENT") {
        doc.text(fCurrency(total + Number(deliveryFee)).toString(), 195, startY + 23, { align: 'right' });
        doc.text('TTC (DA)', 160, startY + 23, { align: 'right' });
    }

    doc.save('facture_' + number + '.pdf');

}