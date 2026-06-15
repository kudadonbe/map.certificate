<template>
  <article class="certificate" dir="rtl">
    <header class="letterhead">
      <p class="bismi">`</p>
      <div class="letterhead-row">
        <div class="address">
          <p class="organization">{{ organization }}</p>
          <p>{{ location }}</p>
        </div>
        <img
          class="crest"
          :src="crestUrl"
          alt="Maldives national emblem"
        />
        <div aria-hidden="true"></div>
      </div>
    </header>

    <main class="content">
      <h1>{{ title }}</h1>
      <p class="body-copy">
        {{ textBeforeName }}
        <strong>{{ participantName }}</strong>
        ({{ idLabel }}
        <strong>{{ idNumber }}</strong>)
        {{ textAfterId }}
      </p>
      <p class="certificate-date">{{ issueDate }}</p>
    </main>

    <footer class="certificate-footer">
      <div class="signature-block">
        <img :src="signatureUrl" alt="Program coordinator signature" />
        <div class="signature-label">
          <p class="signatory">{{ signatoryName }}</p>
          <p>{{ signatoryRole }}</p>
        </div>
      </div>

      <div class="stamp-block">
        <img :src="sealUrl" alt="Family Court official seal" />
        <p>{{ stampLabel }}</p>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  participantName?: string;
  idNumber?: string;
  issueDate?: string;
  organization?: string;
  location?: string;
  title?: string;
  textBeforeName?: string;
  idLabel?: string;
  textAfterId?: string;
  signatoryName?: string;
  signatoryRole?: string;
  stampLabel?: string;
  crestUrl?: string;
  signatureUrl?: string;
  sealUrl?: string;
}>(), {
  participantName: 'ހުސައިން އަލީ',
  idNumber: 'A123456',
  issueDate: '14 ޖޫން 2026',
  organization: 'ފެމިލީ ކޯޓު',
  location: 'މާލެ، ދިވެހިރާއްޖެ',
  title: 'ކާވެންޏަށް ހޭލުންތެރިކުރުމުގެ ޕްރޮގްރާމު ފުރިހަމަކުރިކަމުގެ ލިޔުން',
  textBeforeName: 'މި ލިޔުމަކީ',
  idLabel: 'އައިޑީކާޑު ނަންބަރު',
  textAfterId: 'ކާވެންޏަށް ހޭލުންތެރިކުރުމުގެ ޕްރޮގްރާމު ފުރިހަމަކޮށްފައިވާތީ ދޫކޮށްފައިވާ ލިޔުމެކެވެ.',
  signatoryName: 'އަޙްމަދު ސައްފާނު',
  signatoryRole: 'ޕްރޮގްރާމް ކޯޑިނޭޓަރ',
  stampLabel: 'ފެމިލީ ކޯޓު',
  crestUrl: '/certificate-assets/nishaan.png',
  signatureUrl: '/certificate-assets/signature-template.png',
  sealUrl: '/certificate-assets/seal.jpg',
});
</script>

<style scoped>
@font-face {
  font-family: 'Faruma';
  src: url('/certificate-assets/FARUMA.TTF') format('truetype');
}

@font-face {
  font-family: 'MV Utheemu';
  src: url('/certificate-assets/MVUTHEEMUREGULAR.TTF') format('truetype');
  font-weight: 400;
}

@font-face {
  font-family: 'MV Utheemu';
  src: url('/certificate-assets/MVUTHEEMUBOLD.TTF') format('truetype');
  font-weight: 700;
}

.certificate {
  position: relative;
  aspect-ratio: 297 / 210;
  width: 100%;
  overflow: hidden;
  background: #fff url('/certificate-assets/border-landscape.png') center / 100% 100% no-repeat;
  color: #111827;
  font-family: 'MV Utheemu', 'Faruma', serif;
  container-type: inline-size;
}

.letterhead {
  position: absolute;
  z-index: 1;
  inset: 10.5% 12% auto;
  text-align: center;
}

.bismi {
  margin: 0 0 0.5%;
  font-family: 'Faruma', serif;
  font-size: 2.1cqw;
  line-height: 1;
}

.letterhead-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding-inline: 5%;
}

.address {
  justify-self: start;
  text-align: right;
  font-size: 1.45cqw;
  line-height: 1.5;
}

.address p {
  margin: 0;
}

.organization {
  font-size: 1.65cqw;
  font-weight: 700;
}

.crest {
  width: auto;
  height: 5.2cqw;
}

.content {
  position: absolute;
  z-index: 1;
  inset: 31% 13% auto;
  text-align: center;
}

.content h1 {
  margin: 0;
  font-size: 2.35cqw;
  font-weight: 700;
  line-height: 1.45;
}

.body-copy {
  margin: 8% 0 0;
  font-size: 1.95cqw;
  line-height: 2;
}

.body-copy strong {
  color: #580f41;
  font-weight: 700;
}

.certificate-date {
  margin: 0.5% 0 0;
  font-size: 1.65cqw;
}

.certificate-footer {
  position: absolute;
  z-index: 1;
  right: 19%;
  bottom: 10%;
  left: 19%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  text-align: center;
}

.signature-block,
.stamp-block {
  position: relative;
  width: 16.8cqw;
  aspect-ratio: 1;
}

.signature-block img {
  position: absolute;
  top: 48%;
  left: 57%;
  width: auto;
  height: 100%;
  max-width: none;
  transform: translate(-50%, -50%);
}

.signature-label,
.stamp-block p {
  position: absolute;
  right: 50%;
  bottom: -2%;
  margin: 0;
  font-size: 1.25cqw;
  line-height: 1.5;
  white-space: nowrap;
  transform: translateX(50%);
}

.signature-label p {
  margin: 0;
}

.signatory {
  font-weight: 700;
}

.stamp-block img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
