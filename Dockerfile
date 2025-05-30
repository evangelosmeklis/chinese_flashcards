FROM node:lts-bookworm-slim

COPY . /hanzifive/

WORKDIR /hanzifive

# Persist database outside of the codebase
RUN mkdir /data
ENV DATABASE_URL="file:/data/dev.db"

RUN yarn install \
	&& npx prisma generate

EXPOSE 3000 

CMD bash -c "npx prisma migrate deploy && exec yarn dev"
