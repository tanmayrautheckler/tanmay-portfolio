import numpy as np, wave, pathlib, subprocess, tempfile
pathlib.Path("public/audio/matchday").mkdir(parents=True, exist_ok=True)
sr=24000;dur=16;n=sr*dur
for j,(id,root,third) in enumerate([('barcelona',48,3),('madrid',50,4),('united',45,3),('bayern',48,4),('juventus',47,3)]):
 rng=np.random.default_rng(74+j); out=np.zeros(n,dtype=np.float64)
 for c,shift in enumerate([0,-3,5,-2]):
  start=int(c*4*sr);size=min(int(4.4*sr),n-start);t=np.arange(size)/sr;env=np.minimum(t/.65,1)*np.minimum((size/sr-t)/.9,1)
  for semitone in [0,third,7,10 if third==3 else 11]:
   f=440*2**((root+shift+semitone-69)/12);out[start:start+size]+=.047*env*(np.sin(2*np.pi*f*t)+.12*np.sin(4*np.pi*f*t))
  for step,note in enumerate([12,19,12,third+12]):
   st=start+int((step+.5)*sr);sz=min(int(1.8*sr),n-st)
   if sz<=0:continue
   t=np.arange(sz)/sr;f=440*2**((root+shift+note-69)/12);e=(1-np.exp(-t*35))*np.exp(-t*2.6);out[st:st+sz]+=.025*e*np.sin(2*np.pi*f*t)
 noise=np.convolve(rng.normal(0,1,n+255),np.ones(256)/256,'valid')[:n];out+=noise*.018
 fade=int(.25*sr);out[:fade]*=np.linspace(0,1,fade);out[-fade:]*=np.linspace(1,0,fade)
 out=np.tanh(out*1.3)*.8
 p=pathlib.Path(tempfile.gettempdir())/('portfolio-score-'+id+'.wav')
 with wave.open(str(p),'w') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((out*32767).astype('<i2').tobytes())
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-codec:a','libmp3lame','-b:a','64k','-ar','24000',f'public/audio/matchday/{id}.mp3'],check=True)
 print(id,'peak',round(20*np.log10(np.abs(out).max()),1),'dBFS','RMS',round(20*np.log10(np.sqrt(np.mean(out*out))),1),'dBFS')
