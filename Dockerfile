FROM tiangolo/uwsgi-nginx-flask:python3.11

RUN mkdir -p /usr/src/app/logs
WORKDIR /usr/src/app

COPY . .

RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 8080

CMD ["python3", "main.py"]