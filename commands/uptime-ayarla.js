const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const louritydb = require("croxydb")
const Discord = require("discord.js")
module.exports = {
    name: "uptime-ayarla",
    description: "Uptime sistemini ayarlarsınız",
    type: 1,
    options: [

        {
            name: "ayarla",
            description: "Uptime sistemini açar/kapatırsınız",
            type: 5,
            required: true,
        },

        {
            name: "kanal",
            description: "Uptime sisteminin kullanılacağı kanalı ayarlarsınız",
            type: 7,
            required: true,
            channel_types: [0]
        },

    ],

    run: async (client, interaction) => {

        const row1 = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("<:r_cop:1033688525926830140>")
                    .setLabel("Sistemi Sıfırla")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId("sistemSıfırla")
            )

        const yetki = new Discord.EmbedBuilder()
            .setColor("Red")
            .setTitle("Yetersiz Yetki!")
            .setDescription("<:Kirmizi:1033666667181527062> ・ **Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!**")
            .setFooter({ text: "Mercy Uptime" })

        const boolean = interaction.options.getBoolean('ayarla')
        const kanal = interaction.options.getChannel('kanal')

        const ayarlandi = new Discord.EmbedBuilder()
            .setColor("Green")
            .setTitle("Başarıyla Ayarlandı!")
            .setDescription(`Uptime Sistemi Başarıyla ${kanal} Olarak **Ayarlandı**!`)
            .setFooter({ text: "Mercy Uptime" })

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki], ephemeral: true })

        interaction.reply({ embeds: [ayarlandi], components: [row1], ephemeral: true })

        louritydb.set(`uptimeBoolan_${interaction.guild.id}`, boolean)
        louritydb.set(`uptimeChannel_${interaction.guild.id}`, kanal.id)

    }

};