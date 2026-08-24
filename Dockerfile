FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# تشغيل المشروع بوضع التطوير الذي يدعم كل الـ paths تلقائياً
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]