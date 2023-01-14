const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const louritydb = require("croxydb")
const louritydb2 = require("orio.db")
const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});
// Mercy gelişmiş uptime botu :)
global.client = client;
client.commands = (global.commands = []);

const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");
const internal = require("stream");
const dbManager = require("orio.db/src/util/dbManager");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: props.dm_permission,
        type: 1
    });

    console.log(`[COMMAND] ${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(`[EVENT] ${name} eventi yüklendi.`)
});


client.login(process.env.token)

// Uptime Modal
const lourityModal = new ModalBuilder()
    .setCustomId('form')
    .setTitle('Link Ekle')
const u2 = new TextInputBuilder()
    .setCustomId('link')
    .setLabel('Proje Linkinizi Giriniz')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(8)
    .setMaxLength(200)
    .setPlaceholder('https://mercy-uptime.glitch.me')
    .setRequired(true)

const row1 = new ActionRowBuilder().addComponents(u2);
lourityModal.addComponents(row1);


const lourityModal2 = new ModalBuilder()
    .setCustomId('form2')
    .setTitle('Link Sil')
const u3 = new TextInputBuilder()
    .setCustomId('baslik1')
    .setLabel('Proje Linkini Giriniz')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(8)
    .setMaxLength(200)
    .setPlaceholder('https://mercy-uptime.glitch.me')
    .setRequired(true)

const row2 = new ActionRowBuilder().addComponents(u3);
lourityModal2.addComponents(row2);


// Uptime Sıfırla
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "sistemSıfırla") {

        let boolean = louritydb.get(`uptimeBoolan_${interaction.guild.id}`)

        if (!boolean) return interaction.reply({
            content: "<:Kirmizi:1033666667181527062> ・ Uptime sistemi zaten **Sıfırlanmış**!",
            ephemeral: true
        })

        interaction.reply({
            content: "<:Kirmizi:1033666667181527062> ・ Uptime sistemi başarıyla **Sıfırlandı**!",
            ephemeral: true
        })

        louritydb.delete(`uptimeBoolan_${interaction.guild.id}`)
        louritydb.delete(`uptimeChannel_${interaction.guild.id}`)

    }
})


// Uptime Kanala Gönderme
client.on('interactionCreate', async interaction => {

    if (interaction.commandName === "uptime-ayarla") {

        const row = new Discord.ActionRowBuilder()

            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("<:r_yesil:1034210144260718633>")
                    .setLabel("Ekle")
                    .setStyle(Discord.ButtonStyle.Success)
                    .setCustomId("ekle")
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("<:r_cop:1033688525926830140>")
                    .setLabel("Sil")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId("sil")
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("<:r_link:1034158510851772567>")
                    .setLabel("Linklerim")
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("linklerim")
            )

        const server = interaction.guild
        let kanal = louritydb.get(`uptimeChannel_${interaction.guild.id}`)
        if (!kanal) return;

        const uptimeMesaj = new Discord.EmbedBuilder()
            .setColor("4e6bf2")
            .setTitle("Mercy Uptime Servisi")
            .setDescription("<:r_yesil:1034210144260718633> Projelerinizi uptime etmek için **Ekle** butonuna tıklayın\n<:r_cop:1033688525926830140> Uptime edilen linklerinizi silmek için **Sil** butonuna tıklayın\n<:r_link:1034158510851772567> Eklenen linklerini görmek için **Linklerim** butonuna tıklayın")
            .setThumbnail(server.iconURL({ dynamic: true }))
            .setFooter({ text: "Mercy Uptime" })

        interaction.guild.channels.cache.get(kanal).send({ embeds: [uptimeMesaj], components: [row] })

    }

})

// Uptime Ekle
client.on('interactionCreate', async interaction => {
    if (interaction.customId === "ekle") {

        let booleann = louritydb.get(`uptimeBoolan_${interaction.guild.id}`)

        if (!booleann) return interaction.reply({ content: "<:Kirmizi:1033666667181527062> ・ **Uptime sistemi aktif değil!**", ephemeral: true }).catch(e => { })

        await interaction.showModal(lourityModal);
    }
})

client.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId === 'form') {

        if (!louritydb.fetch(`uptimeLinks_${interaction.user.id}`)) {
            louritydb.set(`uptimeLinks_${interaction.user.id}`, [])
        }

        const link = interaction.fields.getTextInputValue("link")

        let link2 = louritydb.fetch(`uptimeLinks_${interaction.user.id}`, [])

        let booster = "1039257858480554034" // Özel rol

        if (!link) return

        if (!interaction.member.roles.cache.has(booster)) {
            if (louritydb.fetch(`uptimeLinks_${interaction.user.id}`).length >= 3) {
                return interaction.reply({
                    content: "<:Kirmizi:1033666667181527062> ・ En fazla **3** link ekleyebilirsin!",
                    ephemeral: true
                }).catch(e => { })
            }
        }

        if (interaction.member.roles.cache.has(booster)) {
            if (louritydb.fetch(`uptimeLinks_${interaction.user.id}`).length >= 5) {
                return interaction.reply({
                    content: "<:Kirmizi:1033666667181527062> ・ En fazla **5** link ekleyebilirsin!",
                    ephemeral: true
                }).catch(e => { })
            }
        }


        if (link2.includes(link)) {
            return interaction.reply({
                content: "<:Kirmizi:1033666667181527062> ・ **Bu link zaten sistemde mevcut!**",
                ephemeral: true
            }).catch(e => { })
        }

        if (!link.startsWith("https://")) {
            return interaction.reply({
                content: "Uptime linkin hatalı, lütfen başında `https://` olduğundan emin ol!",
                ephemeral: true
            }).catch(e => { })
        }

        if (!link.endsWith(".glitch.me")) {
            return interaction.reply({
                content: "Uptime linkin hatalı, lütfen sonunda `.glitch.me` olduğundan emin ol!",
                ephemeral: true
            }).catch(e => { })
        }


        louritydb.push(`uptimeLinks_${interaction.user.id}`, link)
        louritydb.push(`uptimeLinks`, link)
        interaction.reply({
            content: "<:Yesil:1033666717974548500> ・ Linkin başarıyla uptime sistemine **Eklendi!**",
            ephemeral: true
        }).catch(e => { })
    }
})


// Uptime Sil
client.on('interactionCreate', async interaction => {
    if (interaction.customId === "sil") {

        let booleann = louritydb.get(`uptimeBoolan_${interaction.guild.id}`)

        if (!booleann) return interaction.reply({ content: "<:Kirmizi:1033666667181527062> ・ **Uptime sistemi aktif değil!**", ephemeral: true }).catch(e => { })

        await interaction.showModal(lourityModal2);
    }
})

client.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId === 'form2') {

        const links = louritydb.get(`uptimeLinks_${interaction.user.id}`)
        let linkInput = interaction.fields.getTextInputValue("baslik1")

        if (!links.includes(linkInput)) return interaction.reply({ content: "<:Kirmizi:1033666667181527062> ・ **Sistemde böyle bir link mevcut değil!**", ephemeral: true }).catch(e => { })

        louritydb.unpush(`uptimeLinks_${interaction.user.id}`, linkInput)
        louritydb.unpush(`uptimeLinks`, linkInput)

        return interaction.reply({ content: "<:Yesil:1033666717974548500> ・ Linkin başarıyla sistemden **Silindi!**", ephemeral: true }).catch(e => { })
    }
})


// Linklerim
client.on('interactionCreate', async interaction => {
    if (interaction.customId === "linklerim") {

        let booleann = louritydb.get(`uptimeBoolan_${interaction.guild.id}`)
        
        if (!booleann) return interaction.reply({ content: "<:Kirmizi:1033666667181527062> ・ **Uptime sistemi aktif değil!**", ephemeral: true })

        	const rr = louritydb.get(`uptimeLinks_${interaction.user.id}`)
 			if (!rr) return interaction.reply({content: "<:Kirmizi:1033666667181527062> ・ **Sisteme eklenmiş bir linkin yok!**", ephemeral: true})
        
        const links = louritydb.get(`uptimeLinks_${interaction.user.id}`).map(map => `<:r_link:1034158510851772567> \`${map}\` `).join("\n")

        const linklerimEmbed = new EmbedBuilder()
            .setTitle(`Uptime Linklerin`)
            .setDescription(`${links || "<:Kirmizi:1033666667181527062> ・ **Sisteme eklenmiş bir link yok!**"}`)
            .setColor("Blurple")

        interaction.reply({
            embeds: [linklerimEmbed],
            ephemeral: true
        }).catch(e => { })

    }
})